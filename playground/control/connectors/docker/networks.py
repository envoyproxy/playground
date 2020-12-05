# -*- coding: utf-8 -*-

from aiodocker.exceptions import DockerError

from playground.control.attribs import (
    NetworkAddAttribs, NetworkDeleteAttribs,
    NetworkEditAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.base import PlaygroundDockerResources
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerNetworks(PlaygroundDockerResources):
    _docker_resource = 'networks'
    name = 'network'

    @method_decorator(cmd(attribs=NetworkAddAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        try:
            await self._create_network(command)
        except DockerError:
            # todo: raise playtime error
            return

    @method_decorator(cmd(attribs=NetworkDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        try:
            await self._delete_network(command)
        except DockerError:
            # todo: raise playtime error
            return

    @method_decorator(cmd(attribs=NetworkEditAttribs))
    async def edit(
            self,
            command: PlaygroundCommand) -> None:
        try:
            await self._edit_network(command)
        except DockerError:
            # todo: raise playtime error
            return

    async def _connect(self, network, containers):
        for container in containers:
            await network.connect(self._get_container_config(container))
            if container['type'] == 'proxy':
                await self.docker.containers.container(
                    container['id']).kill(
                        signal='SIGHUP')

    async def _create_network(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.docker.networks.create(
            dict(name="__playground_%s" % command.data.name,
                 labels={"envoy.playground.network": command.data.name}))
        await self._connect(
            network,
            (container
             for container in await self.connector.proxies.list()
             if container['name'] in command.data.proxies))
        await self._connect(
            network,
            (container
             for container in await self.connector.services.list()
             if container['name'] in command.data.services))

    async def _delete_network(
            self,
            command: PlaygroundCommand) -> None:
        try:
            network = await self.docker.networks.get(command.data.id)
        except DockerError:
            # todo: raise playtime error
            return
        info = await network.show()
        if "envoy.playground.network" not in info["Labels"]:
            # raise error/warning ?
            return
        for container in info["Containers"].keys():
            await network.disconnect({"Container": container})
        await network.delete()

    async def _disconnect(self, network, containers):
        for container in containers:
            await network.disconnect({"Container": container["id"]})

    async def _edit_network(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.docker.networks.get(command.data.id)
        info = await network.show()
        containers = {
            container['Name'].replace(
                'envoy__playground__service__', '').replace(
                    'envoy__playground__proxy__', '')
            for container
            in info["Containers"].values()}
        expected = (
            set(command.data.proxies or [])
            | set(command.data.services or []))
        connect = expected - containers
        disconnect = containers - expected
        _containers = (
            await self.connector.proxies.list()
            + await self.connector.services.list())
        await self._connect(
            network,
            (container
             for container in _containers
             if container['name'] in connect))
        await self._disconnect(
            network,
            (container
             for container in _containers
             if container['name'] in disconnect))

    def _get_container_config(self, container):
        return {
            "Container": container["id"],
            "EndpointConfig": {
                "Aliases": [container['name']]}}
