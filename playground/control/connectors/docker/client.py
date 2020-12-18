# -*- coding: utf-8 -*-

from collections import OrderedDict

import aiodocker

from playground.control.connectors.docker.events import (
    PlaygroundDockerEvents)
from playground.control.connectors.docker.images import (
    PlaygroundDockerImages)
from playground.control.connectors.docker.networks import (
    PlaygroundDockerNetworks)
from playground.control.connectors.docker.proxies import (
    PlaygroundDockerProxies)
from playground.control.connectors.docker.services import (
    PlaygroundDockerServices)
from playground.control.connectors.docker.volumes import (
    PlaygroundDockerVolumes)
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerClient(object):
    _envoy_label = "envoy.playground"

    def __init__(self, api):
        self.api = api
        self.docker = aiodocker.Docker()
        self.images = PlaygroundDockerImages(self)
        self.volumes = PlaygroundDockerVolumes(self)
        self.proxies = PlaygroundDockerProxies(self)
        self.services = PlaygroundDockerServices(self)
        self.networks = PlaygroundDockerNetworks(self)
        self.events = PlaygroundDockerEvents(self)
        self._subscribers = []

    @method_decorator(cmd)
    async def clear(self) -> None:
        await self.networks.clear()
        await self.proxies.clear()
        await self.services.clear()

    @method_decorator(cmd(sync=True))
    async def dump_resources(self) -> list:
        proxies = {
            proxy['name']: proxy
            for proxy
            in await self.proxies.list()}
        services = {
            service['name']: service
            for service
            in await self.services.list()}
        networks = {
            network['name']: network
            for network
            in await self.networks.list()}
        return dict(
            networks=networks,
            proxies=proxies,
            services=services)

    async def emit_error(self, message: str):
        for _subscriber in self._subscribers:
            await _subscriber(message)

    async def get_container(self, id: str):
        return await self.docker.containers.get(id)

    async def get_network(self, id: str):
        return await self.docker.networks.get(id)

    def subscribe(self, handler, debug):
        errors = handler.pop("errors", None)
        if errors:
            self._subscribers.append(errors)
        self.events.subscribe(handler, debug)
