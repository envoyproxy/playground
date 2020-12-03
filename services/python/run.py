
from aiohttp import web


async def root_handler(request):
    return web.Response(text='Hello, aio world')


if __name__ == "__main__":
    app = web.Application()
    app.router.add_route('*', '/', root_handler)
    web.run_app(app)
