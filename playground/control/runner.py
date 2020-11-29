import os
from typing import Callable

from aiohttp import web
import aiohttp_cors # type: ignore

from playground.control.api import PlaygroundAPI


class PlaygroundRunner(object):

    def __init__(self, endpoints: tuple, cors_allowed: str):
        self.endpoints = endpoints
        self.cors_allowed = cors_allowed
        self.app = web.Application()
        self.api = PlaygroundAPI()
        self.cors = aiohttp_cors.setup(self.app)
        self.add_endpoints()
        self.add_static()

    def add_endpoint(
            self,
            path: str,
            handler: Callable[[web.Request], web.Response],
            method: str = "GET") -> None:
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
        if os.path.exists('/code/build'):
            self.app.router.add_route('*', '/', self.root_handler)
            routes = [
                web.static(
                    '/',
                    "/code/build",
                    show_index=True)]
            self.app.add_routes(routes)
        else:
            self.cors.add(
                self.app.router.add_static('/static', "/services"),
                {self.cors_allowed: aiohttp_cors.ResourceOptions(
                    allow_credentials=True,
                    expose_headers=("X-Custom-Server-Header",),
                    allow_headers=("X-Requested-With", "Content-Type"),
                    max_age=3600)})

    async def root_handler(self, request: web.Request) -> web.Response:
        return web.HTTPFound('/index.html')

    def run(self) -> None:
        # todo: add on_cleanup
        self.app.on_startup.append(self.api.listen)
        web.run_app(self.app)
