# -*- coding: utf-8 -*-

from playground.control.api.handler.base import BasePlaygroundEventHandler
from playground.control.attribs import NetworkEventAttribs
from playground.control.decorators import handler, method_decorator
from playground.control.event import PlaygroundEvent


class PlaygroundNetworkEventHandler(BasePlaygroundEventHandler):

    @method_decorator(handler(attribs=NetworkEventAttribs))
    async def handle(
            self,
            event: PlaygroundEvent) -> None:
        await getattr(self, f'{event.data.action}')(event)

    async def connect(
            self,
            event: PlaygroundEvent) -> None:
        return await self._connection(event)

    async def create(
            self,
            event: PlaygroundEvent) -> None:
        return await self._connection(event)

    async def destroy(
            self,
            event: PlaygroundEvent) -> None:
        await self._publish(
            event,
            dict(id=event.data.id[:10]))

    async def disconnect(
            self,
            event: PlaygroundEvent) -> None:
        return await self._connection(event)

    async def _publish(
            self,
            event: PlaygroundEvent,
            data: dict) -> None:
        _event = dict(
            id=event.data.id[:10],
            action=event.data.action,
            name=event.data.name)
        _event.update(data)
        await self.handler.api.publish_network(_event)

    async def _connection(self, event):
        _event = dict(
            networks={
                event.data.name: dict(
                    name=event.data.name,
                    id=event.data.id[:10],
                    containers=event.data.containers)})
        if event.data.proxy:
            _event['proxy'] = event.data.proxy
        if event.data.service:
            _event['service'] = event.data.service
        await self._publish(event, _event)
