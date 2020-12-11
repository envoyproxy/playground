# -*- coding: utf-8 -*-

from playground.control.api.handler.network import (
    PlaygroundNetworkEventHandler)
from playground.control.api.handler.proxy import (
    PlaygroundProxyEventHandler)
from playground.control.api.handler.service import (
    PlaygroundServiceEventHandler)
from playground.control.attribs import ImageEventAttribs
from playground.control.decorators import handler, method_decorator
from playground.control.event import PlaygroundEvent


class PlaygroundEventHandler(object):

    def __init__(self, api):
        self.api = api
        self.network = PlaygroundNetworkEventHandler(api)
        self.proxy = PlaygroundProxyEventHandler(api)
        self.service = PlaygroundServiceEventHandler(api)
        self.handler = dict(
            errors=self.handle_errors,
            image=self.handle_image,
            proxy=self.proxy.handle,
            service=self.service.handle,
            network=self.network.handle)
        self.debug = []

    # @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle_errors(
            self,
            message: str) -> None:
        await self.api.publish(dict(playtime_errors=[message]))

    @method_decorator(handler(attribs=ImageEventAttribs))
    async def handle_image(
            self,
            event: PlaygroundEvent) -> None:
        # print('IMAGE EVENT!', event)
        if event.data.action in ['pull_start', 'build_start']:
            await self.api.publish(
                dict(type='image',
                     image=event.data.image,
                     status=event.data.action))

    def subscribe(self, connector):
        connector.subscribe(self.handler, debug=self.debug)
