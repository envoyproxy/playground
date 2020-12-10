# -*- coding: utf-8 -*-

from playground.control.api.handler.base import PlaygroundContainerEventHandler


class PlaygroundProxyEventHandler(PlaygroundContainerEventHandler):

    async def publish(
            self,
            data: dict = None) -> None:
        await self.handler.api.publish_proxy(data)
