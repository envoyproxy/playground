# -*- coding: utf-8 -*-

from playground.control.api.handler.base import PlaygroundContainerEventHandler


class PlaygroundServiceEventHandler(PlaygroundContainerEventHandler):

    async def publish(
            self,
            data: dict = None) -> None:
        await self.handler.api.publish_service(data)
