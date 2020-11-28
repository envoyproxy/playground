
import rapidjson as json

from aiohttp.web import Request

from .attribs import ValidatingAttribs


class PlaygroundRequest(object):

    def __init__(self, request: Request, attribs: ValidatingAttribs = None):
        self._request = request
        self._attribs = attribs

    async def load_data(self):
        self._data = self._attribs(
            **await self._request.json(loads=json.loads))

    async def validate(self, api):
        await self._data.validate(api)
        self._valid_data = self._data

    @property
    def data(self):
        return self._valid_data
