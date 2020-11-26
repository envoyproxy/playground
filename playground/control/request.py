
import json
from collections import OrderedDict


class PlaygroundRequest(object):

    def __init__(self, request, attribs=None):
        self._request = request
        self._attribs = attribs

    # todo, consider using faster json implementation
    def _json_loader(self, content):
        return json.loads(content, object_pairs_hook=OrderedDict)

    async def load_data(self):
        self.data = self._attribs(**await self._request.json(loads=self._json_loader))

    async def validate(self, api):
        return await self.data.validate(api)
