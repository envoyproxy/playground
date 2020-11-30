# -*- coding: utf-8 -*-

from playground.control.attribs import ValidatingAttribs


class PlaygroundCommand(object):

    def __init__(self, kwargs: dict, attribs: ValidatingAttribs = None):
        self._kwargs = kwargs
        self._attribs = attribs

    async def load_data(self) -> None:
        self.data = (
            self._attribs(
                **self._kwargs)
            if self._attribs
            else None)
