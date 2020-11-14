import os

from aiohttp import web
import aiohttp_cors

from api import PlaygroundAPI


CORS_ALLOWED = "http://localhost:5555"

app = web.Application()
cors = aiohttp_cors.setup(app)

api = PlaygroundAPI()
endpoints = (
    ("/resources", api.dump_resources),
    ("/events", api.events),
    ("/clear", api.clear),
    ("/network/get", api.get_network, "POST"),
    ("/network/add", api.add_network, "POST"),
    ("/network/edit", api.edit_network, "POST"),
    ("/network/delete", api.delete_network, "POST"),
    ("/proxy/get", api.get_proxy, "POST"),
    ("/proxy/add", api.add_proxy, "POST"),
    ("/proxy/delete", api.delete_proxy, "POST"),
    ("/service/get", api.get_service, "POST"),
    ("/service/add", api.add_service, "POST"),
    ("/service/delete", api.delete_service, "POST"))


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


if __name__ == "__main__":
    for endpoint in endpoints:
        _add_endpoint(*endpoint)

    if os.path.exists('/code/build'):
        app.router.add_route('*', '/', root_handler)
        routes = [
            web.static(
                '/',
                "/code/build",
                show_index=True)]
    else:
        routes = [web.static('/static', "/services")]
    app.add_routes(routes)
    web.run_app(app)
