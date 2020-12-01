# -*- coding: utf-8 -*-

from typing import Awaitable, Callable, Type, Union

import aiohttp
from aiohttp import web
import aiohttp_cors  # type: ignore

from playground.control.api import PlaygroundAPI


class PlaygroundRunner(object):

    def __init__(
            self,
            endpoints: tuple,
            cors_allowed: str,
            playground_env: str,
            playground_services: tuple):
        self.endpoints = endpoints
        self.cors_allowed = cors_allowed
        self.playground_env = playground_env
        self.app = web.Application()
        self.api = PlaygroundAPI(services=playground_services)
        self.cors = aiohttp_cors.setup(self.app)
        self.add_endpoints()
        self.add_static()

    def add_endpoint(
            self,
            path: str,
            handler: Union[
                Type[aiohttp.abc.AbstractView],
                Callable[
                    [web.Request],
                    Awaitable[web.StreamResponse]]],
            method: str = "GET") -> None:
        if self.playground_env == 'production':
            self.app.router.add_resource(path).add_route(method, handler)
        elif self.cors_allowed:
            route = self.cors.add(
                self.app.router.add_resource(path)).add_route(method, handler)
            self.cors.add(
                route,
                {self.cors_allowed: aiohttp_cors.ResourceOptions(
                    allow_credentials=True,
                    expose_headers=("X-Custom-Server-Header",),
                    allow_headers=("X-Requested-With", "Content-Type"),
                    max_age=3600)})

    def add_endpoints(self) -> None:
        for endpoint in self.endpoints:
            endpoint = (
                endpoint[0],
                getattr(self.api, endpoint[1])) + endpoint[2:]
            self.add_endpoint(*endpoint)

    def add_static(self) -> None:
        if self.playground_env == 'production':
            self.app.router.add_route('*', '/', self.root_handler)
            routes = [
                web.static(
                    '/',
                    "/code/build",
                    show_index=True)]
            self.app.add_routes(routes)
        elif self.cors_allowed:
            self.cors.add(
                self.app.router.add_static('/static', "/services"),
                {self.cors_allowed: aiohttp_cors.ResourceOptions(
                    allow_credentials=True,
                    expose_headers=("X-Custom-Server-Header",),
                    allow_headers=("X-Requested-With", "Content-Type"),
                    max_age=3600)})
        else:
            # todo: raise an error/warning ?
            pass

    async def root_handler(self, request: web.Request) -> web.Response:
        return web.HTTPFound('/index.html')

    def run(self) -> None:
        # todo: add on_cleanup
        self.app.on_startup.append(self.api.listen)
        web.run_app(self.app)
