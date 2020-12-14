# -*- coding: utf-8 -*-

import logging
from typing import Union

from aiodocker.containers import DockerContainers
from aiodocker.exceptions import DockerError
from aiodocker.networks import DockerNetworks

from playground.control.attribs import ContainerDeleteAttribs
from playground.control.command import PlaygroundCommand
from playground.control.decorators import cmd, method_decorator
from playground.control.exceptions import PlaytimeError


logger = logging.getLogger(__name__)


class PlaygroundDockerContext(object):

    def __init__(self, connector):
        self.connector = connector
        self.docker = connector.docker


class PlaygroundDockerResources(PlaygroundDockerContext):

    async def clear(self):
        for resource in await self.list():
            await self.delete(dict(id=resource['id']))

    async def get(self, uuid):
        types = {
            f'envoy.playground.{container_type}'
            for container_type
            in ['service', 'proxy']}
        try:
            container = await self.docker.containers.get(uuid)
        except DockerError:
            logger.error(
                f'Failed getting container {uuid}')
            return
        return (
            container
            if types.intersection(container['Config']['Labels'].keys())
            else None)

    @method_decorator(cmd(attribs=ContainerDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Deleting {self.name}: {command.data.id}')
        container = await self.get(command.data.id)
        if not container:
            logger.warning(
                f'Unable to find container to delete: {command.data.id}')
            return
        await self._delete_container(container)

    async def _delete_container(self, container):
        try:
            await container.stop()
            await container.wait()
            await container.delete(v=True, force=True)
            volumes = [
                v['Name']
                for v
                in container.__dict__['_container']['Mounts']]
            await self.connector.volumes.delete(volumes)
            return True
        except DockerError as e:
            logger.warning(
                f'Failed deleting {container}: {e}')
            if e.args[0] == 409:
                raise PlaytimeError(e.args[1]['message'])
            return False

    def _get_image_name(self, playground_image):
        envoy_image = playground_image.split(
            '/')[1].split(':')[0].replace('-playground', '')
        tag = playground_image.split(':')[1]
        return f"envoyproxy/{envoy_image}:{tag}"

    async def list(self) -> list:
        if not self._docker_resource or not self.name:
            return []
        return await self._list_resources(
            getattr(self.docker, self._docker_resource),
            self.name)

    async def _list_resources(
            self,
            resources: Union[DockerContainers, DockerNetworks],
            name: str) -> list:
        _resources = []
        label = "%s.%s" % (self.connector._envoy_label, name)
        try:
            docker_resources = await resources.list()
        except DockerError:
            logger.error(
                f'Failed listing containers: {name}')
            return []
        for resource in docker_resources:
            if label not in resource["Labels"]:
                continue
            _resource = dict(
                name=resource["Labels"][label],
                id=resource["Id"][:10],
                type=name)
            await self._mangle_resource(resource, _resource)
            _resources.append(_resource)
        return _resources

    async def _remove_container(self, container):
        volumes = [
            v['Name']
            for v in container['Mounts']]
        try:
            await self._delete_container(container)
        except PlaytimeError as e:
            logger.error(
                f'Failed removing container {e}')
            await self.connector.emit_error(e.args[0])
            return
        if volumes:
            await self._remove_volumes(volumes)

    async def _remove_volumes(self, volumes):
        _volumes = await self.docker.volumes.list()
        for volume in _volumes['Volumes']:
            volume_name = volume['Name']
            if volume_name not in volumes:
                continue
            volume_delete = self.docker._query(
                f"volumes/{volume_name}",
                method="DELETE")
            try:
                async with volume_delete:
                    pass
            except DockerError as e:
                logger.error(
                    f'Failed removing volume {volume_name} {e}')

    async def _start_container(self, config, name):
        logger.debug(
            f'Starting {self.name}: {name}')
        try:
            container = await self.docker.containers.create_or_replace(
                config=config,
                name=f"envoy__playground__{self.name}__{name}")
            await container.start()
        except DockerError as e:
            logger.error(
                f'Failed starting container {name} {config} {e}')
