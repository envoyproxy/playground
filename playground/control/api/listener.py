
from collections import OrderedDict

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

    @property
    def metadata(self):
        return dict(
            version=self._envoy_image,
            max_network_connections=MAX_NETWORK_CONNECTIONS,
            min_name_length=MIN_NAME_LENGTH,
            max_name_length=MAX_NAME_LENGTH,
            min_config_length=MIN_CONFIG_LENGTH,
            max_config_length=MAX_CONFIG_LENGTH)

    # todo: use a cached property or somesuch.
    @property
    def service_types(self) -> dict:
        with open(self._services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    @method_decorator(api)
    async def clear(self, request: PlaygroundRequest) -> web.Response:
        response = await self.connector.clear()
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api)
    async def dump_resources(self, request: PlaygroundRequest) -> web.Response:
        response = await self.connector.dump_resources()
        response.update(
            dict(meta=self.metadata,
                 service_types=self.service_types))
        return web.json_response(response, dumps=json.dumps)

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
        # always ?
        finally:
            self.unsubscribe(ws)

    async def listen(self, app: web.Application) -> None:
        self.handler.subscribe()

    def subscribe(self, ws: web.WebSocketResponse):
        self._sockets.append(ws)

    def unsubscribe(self, ws: web.WebSocketResponse):
        self._sockets.remove(ws)

    @method_decorator(api(attribs=NetworkAddAttribs))
    async def network_add(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.network_create(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkDeleteAttribs))
    async def network_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.network_delete(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=NetworkEditAttribs))
    async def network_edit(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.network_edit(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ProxyAddAttribs))
    async def proxy_add(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        kwargs = attr.asdict(request.data)
        kwargs['image'] = self._envoy_image
        await self.connector.proxy_create(kwargs)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ProxyDeleteAttribs))
    async def proxy_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.proxy_delete(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    async def publish(
            self,
            event: dict) -> None:
        for socket in self._sockets:
            await socket.send_json(event, dumps=json.dumps)

    @method_decorator(api(attribs=ServiceAddAttribs))
    async def service_add(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        command = attr.asdict(request.data)
        service_config = self.service_types[request.data.service_type]
        command['image'] = service_config.get("image")
        if command.get('configuration'):
            command['config_path'] = service_config['labels'].get(
                'envoy.playground.config.path')
        await self.connector.service_create(command)
        return web.json_response(dict(message="OK"), dumps=json.dumps)

    @method_decorator(api(attribs=ServiceDeleteAttribs))
    async def service_delete(self, request: PlaygroundRequest) -> web.Response:
        await request.validate(self)
        await self.connector.service_delete(attr.asdict(request.data))
        return web.json_response(dict(message="OK"), dumps=json.dumps)
