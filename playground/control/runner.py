import os

from aiohttp import web
import aiohttp_cors

from .api import PlaygroundAPI


class PlaygroundRunner(object):

    def __init__(self, endpoints, cors_allowed):
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
            handler,
            method="GET") -> None:
        self.cors.add(
            self.cors.add(self.app.router.add_resource(path)).add_route(method, handler),
            {self.cors_allowed: aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600)})

    def add_endpoints(self):
        for endpoint in self.endpoints:
            endpoint = (
                endpoint[0],
                getattr(self.api, endpoint[1])) + endpoint[2:]
            self.add_endpoint(*endpoint)

    def add_static(self):
        if os.path.exists('/code/build'):
            self.app.router.add_route('*', '/', self.root_handler)
            routes = [
                web.static(
                    '/',
                    "/code/build",
                    show_index=True)]
            app.add_routes(routes)
        else:
            self.cors.add(
                self.app.router.add_static('/static', "/services"),
                {self.cors_allowed: aiohttp_cors.ResourceOptions(
                    allow_credentials=True,
                    expose_headers=("X-Custom-Server-Header",),
                    allow_headers=("X-Requested-With", "Content-Type"),
                    max_age=3600)})

    async def root_handler(self, request):
        return web.HTTPFound('/index.html')

    def run(self):
        web.run_app(self.app)
