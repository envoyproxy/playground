# -*- coding: utf-8 -*-

from typing import Union

from aiodocker.containers import DockerContainers
from aiodocker.exceptions import DockerError
from aiodocker.networks import DockerNetworks

from playground.control.attribs import ContainerDeleteAttribs
from playground.control.command import PlaygroundCommand
from playground.control.decorators import cmd, method_decorator
from playground.control.exceptions import PlaytimeError


class PlaygroundDockerContext(object):

    def __init__(self, connector):
        self.connector = connector
        self.docker = connector.docker


class PlaygroundDockerResources(PlaygroundDockerContext):

    async def clear(self):
        for resource in await self.list():
            await self.delete(dict(name=resource['name']))

    @method_decorator(cmd(attribs=ContainerDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        # todo: use uuid
        for container in await self.docker.containers.list():
            if f"envoy.playground.{self.name}" in container["Labels"]:
                name_matches = (
                    f"/envoy__playground__{self.name}__{command.data.name}"
                    in container["Names"])
                if name_matches:
                    await self._delete_container(container)

    async def _delete_container(self, container):
        try:
            await container.stop()
            await container.wait()
            await container.delete(v=True, force=True)
            return True
        except DockerError as e:
            if e.args[0] == 409:
                raise PlaytimeError(e.args[1]['message'])
            # todo: log warning ?
            return False

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
            # todo: raise playtime error ?
            return []
        for resource in docker_resources:
            if label not in resource["Labels"]:
                continue
            _resource = dict(
                name=resource["Labels"][label],
                id=resource["Id"][:10])

            # todo move these bits outa here
            if name == "proxy":
                _resource['image'] = resource['Image']
                _resource['type'] = 'proxy'
                _resource['port_mappings'] = [
                    {'mapping_from': m.get('PublicPort'),
                     'mapping_to': m.get('PrivatePort')}
                    for m
                    in resource['Ports']
                    if m.get('PublicPort')]
                if not _resource['port_mappings']:
                    del _resource['port_mappings']

            if name == "service":
                _resource['image'] = resource['Image']
                _resource['type'] = 'service'
                _resource["service_type"] = resource["Labels"][
                    "envoy.playground.service.type"]

            if name == "network":
                try:
                    _actual_network = await resources.get(resource["Id"])
                    info = await _actual_network.show()
                except DockerError:
                    # todo: raise playtime error ?
                    pass
                else:
                    if info["Containers"]:
                        _resource["containers"] = [
                            container[:10]
                            for container
                            in info["Containers"].keys()]
            _resources.append(_resource)
        return _resources

    async def _remove_container(self, container):
        volumes = [
            v['Name']
            for v in container['Mounts']]
        try:
            await self._delete_container(container)
        except PlaytimeError as e:
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
            except DockerError:
                # todo: raise playtime error ?
                pass

    async def _start_container(self, config, name):
        try:
            container = await self.docker.containers.create_or_replace(
                config=config,
                name=f"envoy__playground__{self.name}__{name}")
            await container.start()
        except DockerError:
            # todo: raise playtime error ?
            pass
