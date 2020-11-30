
from collections import OrderedDict
from typing import Union

import rapidjson as json  # type: ignore

from aiohttp.web import Request

from playground.control.attribs import ValidatingAttribs


class PlaygroundRequest(object):

    def __init__(self, request: Request, attribs: ValidatingAttribs = None):
        self._request = request
        self._attribs = attribs

    async def load_data(self) -> None:
        self._data = (
            self._attribs(
                **await self._request.json(loads=json.loads))
            if self._attribs
            else None)

    # api: api.listener.PlaygroundAPI
    async def validate(self, api) -> None:
        await self._data.validate(api)
        self._valid_data = self._data

    @property
    def data(self) -> Union[dict, OrderedDict]:
        # todo: test this - showing as covered, but not
        return self._valid_data
