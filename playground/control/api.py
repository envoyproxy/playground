import asyncio
import base64
import functools
import json
import os
from collections import OrderedDict

import yaml

from aiohttp import web
from aiohttp.web import Request, Response

from aiodocker.exceptions import DockerError

from .connectors.docker.client import PlaygroundDockerClient

from decorators import api, method_decorator
from request import PlaygroundRequest
from attribs import (
    AddNetworkAttribs, DeleteNetworkAttribs, EditNetworkAttribs,
    AddProxyAttribs, DeleteProxyAttribs,
    AddServiceAttribs, DeleteServiceAttribs)


class PlaygroundAPI(object):
    _services_yaml = "/services.yaml"

    def __init__(self):
        self.client = PlaygroundDockerClient()

    @property
    def service_types(self) -> dict:
        with open(self._services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    # todo, consider using faster json implementation
    def _json_loader(self, content):
        return json.loads(content, object_pairs_hook=OrderedDict)

    def _json_dumper(self, content):
        return json.dumps(content)

    async def load_json(self, request):
        return await request.json(loads=self._json_loader)

    def dump_json(self, content):
        return web.json_response(content, dumps=self._json_dumper)

    @method_decorator(api(attribs=AddNetworkAttribs))
    async def add_network(self, request: PlaygroundRequest) -> Response:
        await self.client.create_network(
            request.data.name,
            proxies=request.data.proxies,
            services=request.data.services)
        return self.dump_json(dict(message="OK"))

    @method_decorator(api(attribs=EditNetworkAttribs))
    async def edit_network(self, request: PlaygroundRequest) -> Response:
        await self.client.edit_network(
            request.data.id,
            proxies=request.data.proxies,
            services=request.data.services)
        return self.dump_json(dict(message="OK"))

    async def populate_volume(self, container_type, name, mount, files):
        # create volume
        volume = await self.client.create_volume(container_type, name, mount)

        if files:
            # write files into the volume
            await self.client.write_volume(volume.name, mount, files)

        return volume

    @method_decorator(api(attribs=AddProxyAttribs))
    async def add_proxy(self, request: PlaygroundRequest) -> Response:
        # todo: move client._envoy_image here
        if not await self.client.image_exists(self.client._envoy_image):
            await self.client.pull_image(self.client._envoy_image)

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
            '/logs': await self.client.create_volume(
                'proxy', request.data.name, 'logs')}

        # create the proxy
        await self.client.create_proxy(
            request.data.name,
            mounts,
            mappings,
            request.data.logging)
        return self.dump_json(dict(message="OK"))

    async def handle_image(self, ws, event):
        if event['Action'] == 'pull':
            # todo: if image is one configured for envoy or services
            #  then emit a signal to ui. This will be more useful
            #  when socket events are fixed.
            pass

    @method_decorator(api(attribs=AddServiceAttribs))
    async def add_service(self, request: PlaygroundRequest) -> Response:
        data = dict(name=request.data.name, service_type=request.data.service_type)
        service_config = self.service_types[request.data.service_type]

        data['image'] = service_config.get("image")
        if not await self.client.image_exists(data['image']):
            await self.client.pull_image(data['image'])

        config_path = service_config['labels'].get('envoy.playground.config.path')
        if config_path:
            config_dir = os.path.dirname(config_path)
            config_fname = os.path.basename(config_path)
            data['mounts'] = OrderedDict(
                ((config_dir, await self.populate_volume(
                    'service',
                    request.data.name,
                    'config',
                    {config_fname: base64.b64encode(
                        request.data.configuration.encode('utf-8')).decode()})), ))
        else:
            data['mounts'] = OrderedDict()
        data['environment'] = request.data.env
        await self.client.create_service(**data)
        return self.dump_json(dict(message="OK"))

    async def clear(self, request: Request) -> Response:
        resources = (
            (self.client.list_services, self.client.delete_service),
            (self.client.list_proxies, self.client.delete_proxy),
            (self.client.list_networks, self.client.delete_network))
        for _resources, remove in resources:
            for resource in await _resources():
                await remove(resource['name'])
        return self.dump_json(dict(message="OK"))

    @method_decorator(api(attribs=DeleteNetworkAttribs))
    async def delete_network(self, request: PlaygroundRequest) -> Response:
        await self.client.delete_network(request.data.name)
        return self.dump_json(dict(message="OK"))

    @method_decorator(api(attribs=DeleteProxyAttribs))
    async def delete_proxy(self, request: PlaygroundRequest) -> Response:
        await self.client.delete_proxy(request.data.name)
        return self.dump_json(dict(message="OK"))

    @method_decorator(api(attribs=DeleteServiceAttribs))
    async def delete_service(self, request: PlaygroundRequest) -> Response:
        await self.client.delete_service(request.data.name)
        return self.dump_json(dict(message="OK"))

    @method_decorator(api)
    async def dump_resources(self, request: PlaygroundRequest) -> Response:
        proxies = OrderedDict()
        for proxy in await self.client.list_proxies():
            proxies[proxy["name"]] = proxy

        networks = OrderedDict()
        for network in await self.client.list_networks():
            networks[network["name"]] = network

        services = OrderedDict()
        for service in await self.client.list_services():
            services[service["name"]] = service

        return self.dump_json(
            dict(version=self.client._envoy_image,
                 proxies=proxies,
                 services=services,
                 service_types=self.service_types,
                 networks=networks))

    async def events(self, request: Request) -> None:
        # todo: dont tie event handling to socket connection
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        handler = dict(
            image=functools.partial(self.handle_image, ws),
            container=functools.partial(self.handle_container, ws),
            network=functools.partial(self.handle_network, ws))
        hashed = str(hash(ws))
        self.client.events.subscribe(hashed, handler, debug=[])
        try:
            while True:
                await ws.receive()
        except RuntimeError as e:
            # todo: handle this better ?
            print(e)
        finally:
            await self.client.events.unsubscribe(hashed)

    async def get_network(self, request: Request) -> Response:
        data = await self.load_json(request)
        result = await self.client.get_network(data["name"])
        return self.dump_json(result)

    async def get_proxy(self, request: Request) -> Response:
        data = await self.load_json(request)
        result = await self.client.get_proxy(data["name"])
        return self.dump_json(result)

    async def get_service(self, request: Request) -> Response:
        data = await self.load_json(request)
        result = await self.client.get_service(data["name"])
        return self.dump_json(result)

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

    async def handle_proxy_creation(self, ws, event):
        # print('PROXY CREATE', event)
        await self.publish(
            ws,
            dict(type="container",
                 resource=event["Actor"]["Attributes"]["name"].split('__')[1],
                 name=event["Actor"]["Attributes"]["name"].split('__')[2],
                 status='creating'))

    async def handle_container_die(self, ws, event: dict) -> None:
        # print('CONTAINER DIE', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.client.client.containers.get(event["id"])
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
                 name=event["Actor"]["Attributes"]["name"],
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
                 name=event["Actor"]["Attributes"]["name"],
                 status=event["status"]))

    async def handle_container_start(self, ws, event: dict) -> None:
        # print('PROXY START', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.client.client.containers.get(event["id"])
        ports = container['HostConfig']['PortBindings'] or {}
        port_mappings = [
            {'mapping_from': v[0]['HostPort'],
             'mapping_to': k.split('/')[0]}
            for k, v in ports.items()]
        await self.publish(
            ws,
            dict(type="container",
                 resource=resource,
                 id=event["id"][:10],
                 image=event['Actor']['Attributes']['image'],
                 name=event["Actor"]["Attributes"]["name"],
                 port_mappings=port_mappings,
                 status=event["status"]))

    async def handle_container_started(self, ws, event: dict) -> None:
        await asyncio.sleep(1)
        container = await self.client.client.containers.get(event["id"])
        show = await container.show()
        if "envoy.playground.proxy" in show["Config"]["Labels"]:
            to_publish = {
                "proxies": {
                    show["Name"].strip(os.path.sep): dict(
                        name=show["Name"].strip(os.path.sep),
                        id=show["Id"][:10])}}
        elif "envoy.playground.service" in show["Config"]["Labels"]:
            to_publish = {
                "services": {
                    show["Name"].strip(os.path.sep): dict(
                        service_type=show["Config"]["Labels"][
                            "envoy.playground.service.type"],
                        name=show["Name"].strip(os.path.sep),
                        id=show["Id"][:10])}}
        to_publish.update(
            dict(type="container",
                 id=show["Id"],
                 name=show["Name"],
                 status=show["State"]["Status"]))
        await self.publish(ws, to_publish)

    async def handle_network(self, ws, event: dict) -> None:
        handlers = ["destroy", "create", "connect", "disconnect"]
        if event['Action'] in handlers:
            await getattr(
                self,
                'handle_network_%s' % event['Action'])(
                    ws, event)

    async def handle_network_create(self, ws, event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        network = await self.client.client.networks.get(nid)
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

    async def handle_network_connect(self, ws, event: dict) -> None:
        nid = event["Actor"]["ID"]
        network = await self.client.client.networks.get(nid)
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

    async def handle_network_disconnect(self, ws, event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        try:
            network = await self.client.client.networks.get(nid)
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

    async def publish(self, ws, event: dict) -> None:
        await ws.send_json(event, dumps=self._json_dumper)
