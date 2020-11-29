
from playground.control.attribs import (
    NetworkAddAttribs, NetworkDeleteAttribs,
    NetworkEditAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerNetworks(object):

    def __init__(self, connector):
        self.connector = connector

    async def clear(self):
        for network in await self.list():
            await self.delete(dict(name=network['name']))

    @method_decorator(cmd(attribs=NetworkAddAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.connector.docker.networks.create(
            dict(name="__playground_%s" % command.data.name,
                 labels={"envoy.playground.network": command.data.name}))
        if command.data.proxies:
            for proxy in await self.connector.list_proxies():
                if proxy['name'] in command.data.proxies:
                    await network.connect({"Container": proxy["id"]})
        if command.data.services:
            for service in await self.connector.list_services():
                if service['name'] in command.data.services:
                    await network.connect({"Container": service["id"]})

    @method_decorator(cmd(attribs=NetworkDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        for network in await self.connector.docker.networks.list():
            if "envoy.playground.network" in network["Labels"]:
                if network["Name"] == "__playground_%s" % command.data.name:
                    _network = await self.connector.docker.networks.get(
                        network["Id"])
                    info = await _network.show()
                    for container in info["Containers"].keys():
                        await _network.disconnect({"Container": container})
                    await _network.delete()

    @method_decorator(cmd(attribs=NetworkEditAttribs))
    async def edit(
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
        for proxy in await self.list_proxies():
            if proxy['name'] in connect:
                await network.connect({"Container": proxy["id"]})
            if proxy['name'] in disconnect:
                await network.disconnect({"Container": proxy["id"]})
        for service in await self.list_services():
            if service['name'] in connect:
                await network.connect({"Container": service["id"]})
            if service['name'] in disconnect:
                await network.disconnect({"Container": service["id"]})

    async def list(self) -> list:
        return await self.connector._list_resources(
            self.connector.docker.networks, "network")
