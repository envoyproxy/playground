
import base64
import functools
import os
from collections import OrderedDict

import rapidjson as json

import yaml

from aiohttp import web
from aiohttp.web import Request, Response

from aiodocker.exceptions import DockerError

from .connectors.docker.client import PlaygroundDockerClient

from .decorators import api, method_decorator
from .request import PlaygroundRequest
from .attribs import (
    MIN_NAME_LENGTH, MAX_NAME_LENGTH,
    MIN_CONFIG_LENGTH, MAX_CONFIG_LENGTH,
    MAX_NETWORK_CONNECTIONS,
    NetworkAddAttribs, NetworkDeleteAttribs, NetworkEditAttribs,
    ProxyAddAttribs, ProxyDeleteAttribs,
    ServiceAddAttribs, ServiceDeleteAttribs)


class PlaygroundAPI(object):
    _services_yaml = "/services.yaml"
    _envoy_image = "envoyproxy/envoy-dev:latest"

    def __init__(self):
        self.connector = PlaygroundDockerClient()

    # todo: use a cached property or somesuch.
    @property
    def service_types(self) -> dict:
        with open(self._services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    async def clear(self, request: Request) -> Response:
        resources = (
            (self.connector.list_services, self.connector.delete_service),
            (self.connector.list_proxies, self.connector.delete_proxy),
            (self.connector.list_networks, self.connector.delete_network))
        for _resources, remove in resources:
            for resource in await _resources():
                await remove(resource['name'])
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api)
    async def dump_resources(self, request: PlaygroundRequest) -> Response:
        proxies = OrderedDict()
        for proxy in await self.connector.list_proxies():
            proxies[proxy["name"]] = proxy

        networks = OrderedDict()
        for network in await self.connector.list_networks():
            networks[network["name"]] = network

        services = OrderedDict()
        for service in await self.connector.list_services():
            services[service["name"]] = service

        return web.json_response(
            dict(meta=dict(
                version=self._envoy_image,
                max_network_connections=MAX_NETWORK_CONNECTIONS,
                min_name_length=MIN_NAME_LENGTH,
                max_name_length=MAX_NAME_LENGTH,
                min_config_length=MIN_CONFIG_LENGTH,
                max_config_length=MAX_CONFIG_LENGTH),
                 proxies=proxies,
                 services=services,
                 service_types=self.service_types,
                 networks=networks),
            dumps=json.dumps)

    async def events(self, request: Request) -> None:
        # todo: dont tie event handling to socket connection
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        handler = dict(
            image=functools.partial(self.handle_image, ws),
            container=functools.partial(self.handle_container, ws),
            network=functools.partial(self.handle_network, ws))
        hashed = str(hash(ws))
        self.connector.events.subscribe(hashed, handler, debug=[])
        try:
            while True:
                await ws.receive()
        except RuntimeError as e:
            # todo: handle this better ?
            print(e)
        finally:
            await self.connector.events.unsubscribe(hashed)

    async def handle_container(self, ws, event: dict) -> None:
        handlers = ["destroy", "start", "die"]
        if event['Action'] not in handlers:
            return
        is_playground_container = set([
            "envoy.playground.proxy",
            "envoy.playground.service"]).intersection(
                event["Actor"]["Attributes"])
        is_proxy_create_container = (
            "envoy.playground.temp.resource" in event["Actor"]["Attributes"]
            and event['status'] == 'start')
        if is_playground_container:
            await getattr(
                self,
                'handle_container_%s' % event['Action'])(ws, event)
        elif is_proxy_create_container:
            await self.handle_proxy_creation(ws, event)

    async def handle_container_die(self, ws, event: dict) -> None:
        # print('CONTAINER DIE', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.connector.get_container(event["id"])
        try:
            logs = await container.log(stdout=True, stderr=True)
            await container.delete(force=True, v=True)
        except DockerError:
            # most likely been killed
            logs = []
        await self.publish(
            ws,
            dict(type="container",
                 resource=resource,
                 id=event["id"][:10],
                 logs=logs,
                 name=event["Actor"]["Attributes"]["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event["status"]))

    async def handle_container_destroy(self, ws, event: dict) -> None:
        # print('CONTAINER DESTROY', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        await self.publish(
            ws,
            dict(type="container",
                 resource=resource,
                 id=event["id"][:10],
                 name=event["Actor"]["Attributes"]["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event["status"]))

    async def handle_container_start(self, ws, event: dict) -> None:
        # print('PROXY START', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.connector.get_container(event["id"])
        to_publish = dict(
            type="container",
            resource=resource,
            id=event["id"][:10],
            image=event['Actor']['Attributes']['image'],
            name=event["Actor"]["Attributes"]["name"].replace(
                f'envoy__playground__{resource}__', ''),
            status=event["status"])
        ports = container['HostConfig']['PortBindings'] or {}
        port_mappings = []
        for container_port, mappings in ports.items():
            for mapping in mappings:
                if mapping['HostPort']:
                    port_mappings.append(
                        dict(mapping_from=mapping['HostPort'],
                             mapping_to=container_port.split('/')[0]))
        if port_mappings:
            to_publish["port_mappings"] = port_mappings
        await self.publish(
            ws,
            to_publish)

    async def handle_image(self, ws, event):
        if event['Action'] == 'pull':
            # todo: if image is one configured for envoy or services
            #  then emit a signal to ui. This will be more useful
            #  when socket events are fixed.
            pass

    async def handle_network(self, ws, event: dict) -> None:
        handlers = ["destroy", "create", "connect", "disconnect"]
        if event['Action'] in handlers:
            await getattr(
                self,
                'handle_network_%s' % event['Action'])(
                    ws, event)

    async def handle_network_connect(self, ws, event: dict) -> None:
        nid = event["Actor"]["ID"]
        network = await self.connector.get_network(nid)
        info = await network.show()
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            await self.publish(
                ws,
                dict(type="network",
                     action=event["Action"],
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_network_create(self, ws, event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        network = await self.connector.get_network(nid)
        info = await network.show()
        name = info["Labels"]["envoy.playground.network"]
        if "envoy.playground.network" not in info["Labels"]:
            return
        await self.publish(
            ws,
            dict(type="network",
                 action=event["Action"],
                 networks={name: dict(name=name, id=nid[:10])}))

    async def handle_network_destroy(self, ws, event: dict) -> None:
        await self.publish(
            ws,
            dict(type="network",
                 action=event["Action"],
                 id=event["Actor"]["ID"][:10]))

    async def handle_network_disconnect(self, ws, event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        try:
            network = await self.connector.get_network(nid)
            info = await network.show()
        except DockerError:
            return
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            await self.publish(
                ws,
                dict(type="network",
                     action=event["Action"],
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_proxy_creation(self, ws, event):
        # print('PROXY CREATE', event)
        await self.publish(
            ws,
            dict(type="container",
                 resource=event["Actor"]["Attributes"]["name"].split('__')[1],
                 name=event["Actor"]["Attributes"]["name"].split('__')[2],
                 status='creating'))

    @method_decorator(api(attribs=NetworkAddAttribs))
    async def network_add(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        await self.connector.create_network(
            request.data.name,
            proxies=request.data.proxies,
            services=request.data.services)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkDeleteAttribs))
    async def network_delete(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        await self.connector.delete_network(request.data.name)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkEditAttribs))
    async def network_edit(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        await self.connector.edit_network(
            request.data.id,
            proxies=request.data.proxies,
            services=request.data.services)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    async def populate_volume(self, container_type, name, mount, files):
        # create volume
        volume = await self.connector.create_volume(
            container_type, name, mount)

        if files:
            # write files into the volume
            await self.connector.write_volume(
                volume.name, mount, files)

        return volume

    @method_decorator(api(attribs=ProxyAddAttribs))
    async def proxy_add(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        if not await self.connector.image_exists(self._envoy_image):
            await self.connector.pull_image(self._envoy_image)

        # todo: remove binary/cert prefixes in js
        mappings = [
            [m['mapping_from'], m['mapping_to']]
            for m
            in request.data.port_mappings]
        mounts = {
            "/etc/envoy": await self.populate_volume(
                'proxy',
                request.data.name,
                'envoy',
                {'envoy.yaml': base64.b64encode(
                    request.data.configuration.encode('utf-8')).decode()}),
            "/certs": await self.populate_volume(
                'proxy',
                request.data.name,
                'certs',
                OrderedDict(
                    (k, v.split(',')[1])
                    for k, v
                    in request.data.certs.items())),
            '/binary': await self.populate_volume(
                'proxy',
                request.data.name,
                'binary',
                OrderedDict(
                    (k, v.split(',')[1])
                    for k, v
                    in request.data.binaries.items())),
            '/logs': await self.connector.create_volume(
                'proxy', request.data.name, 'logs')}

        # create the proxy
        await self.connector.create_proxy(
            self._envoy_image,
            request.data.name,
            mounts,
            mappings,
            request.data.logging)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ProxyDeleteAttribs))
    async def proxy_delete(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        await self.connector.delete_proxy(request.data.name)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    async def publish(self, ws, event: dict) -> None:
        # print("PUBLISH", event)
        await ws.send_json(event, dumps=json.dumps)

    @method_decorator(api(attribs=ServiceAddAttribs))
    async def service_add(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        data = dict(
            name=request.data.name,
            service_type=request.data.service_type)
        service_config = self.service_types[request.data.service_type]

        data['image'] = service_config.get("image")
        if not await self.connector.image_exists(data['image']):
            await self.connector.pull_image(data['image'])

        data['mounts'] = OrderedDict()
        config_path = service_config['labels'].get(
            'envoy.playground.config.path')
        if config_path:
            config = base64.b64encode(
                request.data.configuration.encode('utf-8')).decode()
            data['mounts'][os.path.dirname(config_path)] = (
                await self.populate_volume(
                    'service',
                    request.data.name,
                    'config',
                    {os.path.basename(config_path): config}))
        data['environment'] = request.data.env
        await self.connector.create_service(**data)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ServiceDeleteAttribs))
    async def service_delete(self, request: PlaygroundRequest) -> Response:
        await request.validate(self)
        await self.connector.delete_service(request.data.name)
        return web.json_response(dict(message="OK"), dumps=json.dumps)
