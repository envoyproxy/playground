import os

from aiohttp import web
import aiohttp_cors

from .api import PlaygroundAPI


CORS_ALLOWED = "http://localhost:5555"

app = web.Application()
cors = aiohttp_cors.setup(app)

api = PlaygroundAPI()
endpoints = (
    ("/resources", api.dump_resources),
    ("/events", api.events),
    ("/clear", api.clear),
    ("/network/add", api.network_add, "POST"),
    ("/network/edit", api.network_edit, "POST"),
    ("/network/delete", api.network_delete, "POST"),
    ("/proxy/add", api.proxy_add, "POST"),
    ("/proxy/delete", api.proxy_delete, "POST"),
    ("/service/add", api.service_add, "POST"),
    ("/service/delete", api.service_delete, "POST"))


async def root_handler(request):
    return web.HTTPFound('/index.html')


def _add_endpoint(
        path: str,
        handler,
        method="GET",
        allowed=CORS_ALLOWED) -> None:
    cors.add(
        cors.add(app.router.add_resource(path)).add_route(method, handler),
        {allowed: aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600)})


def main():
    for endpoint in endpoints:
        _add_endpoint(*endpoint)

    if os.path.exists('/code/build'):
        app.router.add_route('*', '/', root_handler)
        routes = [
            web.static(
                '/',
                "/code/build",
                show_index=True)]
        app.add_routes(routes)
    else:
        cors.add(
            app.router.add_static('/static', "/services"),
            {CORS_ALLOWED: aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600)})
    web.run_app(app)


if __name__ == "__main__":
    main()
