# -*- coding: utf-8 -*-

from playground.control.attribs import ValidatingAttribs

from typing import Optional, Type


class PlaygroundCommand(object):

    def __init__(
            self,
            kwargs: dict,
            attribs: Optional[Type[ValidatingAttribs]] = None):
        self._kwargs = kwargs
        self._attribs = attribs

    async def load_data(self) -> None:
        self.data = (
            self._attribs(
                **self._kwargs)
            if self._attribs
            else None)
