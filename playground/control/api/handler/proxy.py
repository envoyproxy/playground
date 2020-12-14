# -*- coding: utf-8 -*-

from playground.control.api.handler.base import PlaygroundContainerEventHandler
from playground.control.attribs import ProxyEventAttribs
from playground.control.decorators import handler, method_decorator
from playground.control.event import PlaygroundEvent


class PlaygroundProxyEventHandler(PlaygroundContainerEventHandler):

    @method_decorator(handler(attribs=ProxyEventAttribs))
    async def handle(
            self,
            event: PlaygroundEvent) -> None:
        await self._handle(event)

    async def publish(
            self,
            data: dict = None) -> None:
        await self.api.publish_proxy(data)

    async def start(
            self,
            event: PlaygroundEvent) -> None:
        _data = dict(
            image=event.data.attributes['image'])
        if event.data.port_mappings:
            _data['port_mappings'] = event.data.port_mappings
        await self._publish(event, _data)

    async def build_start(
            self,
            event: PlaygroundEvent) -> None:
        _data = dict(
            build_from=event.data.build_from,
            image=event.data.image)
        await self._publish(event, _data)

    async def pull_start(
            self,
            event: PlaygroundEvent) -> None:
        _data = dict(
            image=event.data.image)
        await self._publish(event, _data)
