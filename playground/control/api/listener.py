
import base64
import os
from collections import OrderedDict
from typing import Union

import attr

import rapidjson as json  # type: ignore
import yaml

from aiohttp import web

from playground.control.attribs import (
    NetworkAddAttribs, NetworkDeleteAttribs, NetworkEditAttribs,
    ProxyAddAttribs, ProxyDeleteAttribs,
    ServiceAddAttribs, ServiceDeleteAttribs)
from playground.control.constants import (
    MIN_NAME_LENGTH, MAX_NAME_LENGTH,
    MIN_CONFIG_LENGTH, MAX_CONFIG_LENGTH,
    MAX_NETWORK_CONNECTIONS)
from playground.control.connectors.docker.client import PlaygroundDockerClient
from playground.control.decorators import api, method_decorator
from playground.control.request import PlaygroundRequest
from playground.control.api.handler import PlaygroundEventHandler


class PlaygroundAPI(object):
    _services_yaml = "/services.yaml"
    _envoy_image = "envoyproxy/envoy-dev:latest"

    def __init__(self):
        self._sockets = []
        self.connector = PlaygroundDockerClient()
        self.handler = PlaygroundEventHandler(self)

    async def listen(self, app: web.Application) -> None:
        self.handler.subscribe()

    # todo: use a cached property or somesuch.
    @property
    def service_types(self) -> dict:
        with open(self._services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    async def clear(self, request: web.Request) -> web.Response:
        resources = (
            (self.connector.list_services, self.connector.delete_service),
            (self.connector.list_proxies, self.connector.delete_proxy),
            (self.connector.list_networks, self.connector.delete_network))
        for _resources, remove in resources:
            for resource in await _resources():
                await remove(resource['name'])
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api)
    async def dump_resources(self, request: PlaygroundRequest) -> web.Response:
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

    async def events(self, request: web.Request) -> None:
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        self.subscribe(ws)
        try:
            while True:
                await ws.receive()
        except RuntimeError as e:
            # todo: handle this better ?
            print(e)
        finally:
            self.unsubscribe(ws)

    def subscribe(self, ws: web.WebSocketResponse):
        self._sockets.append(ws)

    def unsubscribe(self, ws: web.WebSocketResponse):
        self._sockets.remove(ws)

    @method_decorator(api(attribs=NetworkAddAttribs))
    async def network_add(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.create_network(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkDeleteAttribs))
    async def network_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.delete_network(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkEditAttribs))
    async def network_edit(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.edit_network(
            request.data.id,
            proxies=request.data.proxies,
            services=request.data.services)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    async def populate_volume(
            self,
            container_type: str,
            name: str,
            mount: str,
            files: Union[dict, OrderedDict]):
        # create volume
        volume = await self.connector.create_volume(
            container_type, name, mount)

        if files:
            # write files into the volume
            await self.connector.write_volume(
                volume.name, mount, files)

        return volume

    @method_decorator(api(attribs=ProxyAddAttribs))
    async def proxy_add(self, request: PlaygroundRequest) -> web.Response:
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
    async def proxy_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.delete_proxy(request.data.name)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ServiceAddAttribs))
    async def service_add(self, request: PlaygroundRequest) -> web.Response:
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
    async def service_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.delete_service(request.data.name)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    async def publish(
            self,
            event: dict) -> None:
        for socket in self._sockets:
            await socket.send_json(event, dumps=json.dumps)
