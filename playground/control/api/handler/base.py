# -*- coding: utf-8 -*-

from playground.control.event import PlaygroundEvent


class BasePlaygroundEventHandler(object):

    def __init__(self, handler):
        self.handler = handler


class PlaygroundContainerEventHandler(BasePlaygroundEventHandler):

    async def publish(self, data):
        raise NotImplementedError

    async def _handle(
            self,
            event: PlaygroundEvent) -> None:
        handlers = ["destroy", "start", "die"]
        if event.data.action not in handlers:
            return
        is_volume_container = (
            "envoy.playground.temp.resource"
            in event.data.attributes)
        (await getattr(
            self,
            event.data.action)(event)
         if not is_volume_container
         else await self.volume(event))

    async def destroy(
            self,
            event: PlaygroundEvent) -> None:
        await self._publish(event)

    async def die(
            self,
            event: PlaygroundEvent) -> None:
        (await self._publish(event, dict(logs=event.data.logs))
         if event.data.logs
         else await self._publish(event))

    async def volume(
            self,
            event: PlaygroundEvent) -> None:
        if event.data.status != 'start':
            return
        await self._publish(event, dict(status='volume_create'))

    async def _publish(
            self,
            event: PlaygroundEvent,
            data: dict = None) -> None:
        _event = dict(
            name=event.data.name,
            id=event.data.id[:10],
            status=event.data.status)
        _event.update(data or {})
        await self.publish(_event)
