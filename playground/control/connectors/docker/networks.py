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

    def _get_container_config(self, container):
        return {
            "Container": container["id"],
            "EndpointConfig": {
                "Aliases": [container['name']]}}

    async def _create_network(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.docker.networks.create(
            dict(name="__playground_%s" % command.data.name,
                 labels={"envoy.playground.network": command.data.name}))
        if command.data.proxies:
            for proxy in await self.connector.proxies.list():
                if proxy['name'] in command.data.proxies:
                    await network.connect(self._get_container_config(proxy))
        if command.data.services:
            for service in await self.connector.services.list():
                if service['name'] in command.data.services:
                    await network.connect(self._get_container_config(service))

    @method_decorator(cmd(attribs=NetworkDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        try:
            await self._delete_network(command)
        except DockerError:
            # todo: raise playtime error
            return

    async def _delete_network(
            self,
            command: PlaygroundCommand) -> None:
        for network in await self.docker.networks.list():
            if "envoy.playground.network" in network["Labels"]:
                if network["Name"] == "__playground_%s" % command.data.name:
                    _network = await self.docker.networks.get(
                        network["Id"])
                    info = await _network.show()
                    for container in info["Containers"].keys():
                        await _network.disconnect({"Container": container})
                    await _network.delete()

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
