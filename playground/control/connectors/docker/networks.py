# -*- coding: utf-8 -*-

import logging

from aiodocker.exceptions import DockerError

from playground.control.attribs import (
    NetworkAddAttribs, NetworkDeleteAttribs,
    NetworkEditAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.base import PlaygroundDockerResources
from playground.control.decorators import cmd, method_decorator


logger = logging.getLogger(__name__)


class PlaygroundDockerNetworks(PlaygroundDockerResources):
    _docker_resource = 'networks'
    name = 'network'

    @method_decorator(cmd(attribs=NetworkAddAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Creating network: {command.data}')
        try:
            await self._create_network(command)
        except DockerError as e:
            logger.error(
                f'Failed creating network: {command.data} {e}')

    @method_decorator(cmd(attribs=NetworkDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Deleting network: {command.data}')
        try:
            await self._delete_network(command)
        except DockerError as e:
            logger.error(
                f'Failed deleting network: {command.data} {e}')

    @method_decorator(cmd(attribs=NetworkEditAttribs))
    async def edit(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Updating network: {command.data}')
        try:
            await self._edit_network(command)
        except DockerError as e:
            logger.error(
                f'Failed updating network: {command.data} {e}')

    async def _connect(self, network, name, containers):
        for container in containers:
            logger.debug(
                f'Connecting {container["type"]} {container["name"]} '
                f'to network: {name}')
            try:
                await network.connect(self._get_container_config(container))
            except DockerError as e:
                logger.debug(
                    f'Failed connecting {container["type"]} '
                    f'{container["name"]}'
                    f'to network: {name} {e}')
                continue
            if container['type'] == 'proxy':
                try:
                    await self.docker.containers.container(
                        container['id']).kill(signal='SIGHUP')
                except DockerError as e:
                    logger.error(
                        f'Failed restarting proxy on connect: '
                        f'{container["name"]} {e}')

    async def _create_network(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Creating network: {command.data}')
        try:
            network = await self.docker.networks.create(
                dict(name="__playground_%s" % command.data.name,
                     labels={"envoy.playground.network": command.data.name}))
        except DockerError as e:
            logger.error(
                f'Failed creating network: {command.data} {e}')
            return
        await self._connect(
            network,
            command.data.name,
            (container
             for container in await self.connector.proxies.list()
             if container['name'] in command.data.proxies))
        await self._connect(
            network,
            command.data.name,
            (container
             for container in await self.connector.services.list()
             if container['name'] in command.data.services))

    async def _delete_network(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Deleting network: {command.data}')
        try:
            network = await self.docker.networks.get(command.data.id)
            info = await network.show()
        except DockerError as e:
            logger.error(
                f'Failed getting network for delete: {command.data} {e}')
            return
        if "envoy.playground.network" not in info["Labels"]:
            logger.warng(
                f'Received spurious network: {command.data}')
            return
        for container in info["Containers"].keys():
            logger.debug(
                f'Disconnecting ({container}) from network: '
                f'{command.data}')
            try:
                await network.disconnect({"Container": container})
            except DockerError as e:
                logger.error(
                    f'Failed disconnecting container: '
                    f'{command.data} {container} {e}')
        try:
            await network.delete()
        except DockerError as e:
            logger.error(
                f'Failed removing network: '
                f'{command.data} {e}')

    async def _disconnect(self, network, name, containers):
        for container in containers:
            logger.debug(
                f'Disconnecting {container["type"]} {container["name"]} '
                f'from network: {name}')
            try:
                await network.disconnect({"Container": container["id"]})
            except DockerError as e:
                logger.error(
                    f'Failed disconnecting container: '
                    f'{name} {container["type"]} {container["name"]} {e}')

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
            info['Labels']['envoy.playground.network'],
            (container
             for container in _containers
             if container['name'] in connect))
        await self._disconnect(
            network,
            info['Labels']['envoy.playground.network'],
            (container
             for container in _containers
             if container['name'] in disconnect))

    def _get_container_config(self, container):
        return {
            "Container": container["id"],
            "EndpointConfig": {
                "Aliases": [container['name']]}}

    async def _mangle_resource(self, resource, _resource):
        try:
            _actual_network = await self.docker.networks.get(resource["Id"])
            info = await _actual_network.show()
        except DockerError as e:
            logger.error(
                f'Failed getting info for network: {resource} {e}')
        else:
            if info["Containers"]:
                _resource["containers"] = [
                    container[:10]
                    for container
                    in info["Containers"].keys()]
