# -*- coding: utf-8 -*-

from playground.control.api.handler.base import PlaygroundContainerEventHandler
from playground.control.attribs import ServiceEventAttribs
from playground.control.decorators import handler, method_decorator
from playground.control.event import PlaygroundEvent


class PlaygroundServiceEventHandler(PlaygroundContainerEventHandler):

    @method_decorator(handler(attribs=ServiceEventAttribs))
    async def handle(
            self,
            event: PlaygroundEvent) -> None:
        await self._handle(event)

    async def publish(
            self,
            data: dict = None) -> None:
        await self.api.publish_service(data)

    async def start(
            self,
            event: PlaygroundEvent) -> None:
        _data = dict(
            service_type=event.data.service_type)
        await self._publish(event, _data)
