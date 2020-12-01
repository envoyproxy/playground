# -*- coding: utf-8 -*-

from typing import Optional, Type

from playground.control.attribs import ValidatingAttribs


class PlaygroundEvent(object):

    def __init__(
            self,
            kwargs: dict,
            attribs: Optional[Type[ValidatingAttribs]] = None):
        self._kwargs = kwargs
        self._attribs = attribs

    async def load_data(self) -> None:
        self._data = (
            self._attribs(**self._kwargs)
            if self._attribs
            else None)

    @property
    def data(self):
        # todo: test this - showing as covered, but not
        try:
            return self._data
        except AttributeError:
            return None
