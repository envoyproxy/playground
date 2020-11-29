
import os
from collections import OrderedDict
from typing import Union

import aiodocker
from aiodocker.containers import DockerContainers
from aiodocker.networks import DockerNetworks

from playground.control.connectors.docker.events import (
    PlaygroundDockerEvents)
from playground.control.connectors.docker.networks import (
    PlaygroundDockerNetworks)
from playground.control.connectors.docker.proxies import (
    PlaygroundDockerProxies)
from playground.control.connectors.docker.services import (
    PlaygroundDockerServices)
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerClient(object):
    _envoy_label = "envoy.playground"
    _mount_image = "busybox"

    def __init__(self):
        self.docker = aiodocker.Docker()
        self.events = PlaygroundDockerEvents(self.docker)
        self.networks = PlaygroundDockerNetworks(self)
        self.proxies = PlaygroundDockerProxies(self)
        self.services = PlaygroundDockerServices(self)

    @method_decorator(cmd)
    async def clear(self) -> list:
        await self.networks.clear()
        await self.proxies.clear()
        await self.services.clear()

    @method_decorator(cmd(sync=True))
    async def dump_resources(self) -> list:
        proxies = OrderedDict()
        for proxy in await self.proxies.list():
            proxies[proxy["name"]] = proxy

        networks = OrderedDict()
        for network in await self.networks.list():
            networks[network["name"]] = network

        services = OrderedDict()
        for service in await self.services.list():
            services[service["name"]] = service
        return dict(
            networks=networks,
            proxies=proxies,
            services=services)

    async def get_container(self, id: str):
        return await self.docker.containers.get(id)

    async def get_network(self, id: str):
        return await self.docker.networks.get(id)

    async def image_exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        for image in await self.docker.images.list():
            if image_tag in (image['RepoTags'] or []):
                return True
        return False

    async def pull_image(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.docker.images.pull(image_tag)

    async def volume_create(
            self,
            container_type: str,
            name: str,
            mount: str) -> None:
        volume_config = await self._get_volume_config(
            container_type, name, mount)
        return await self.docker.volumes.create(volume_config)

    async def volume_write(
            self,
            volume: str,
            mount: str,
            files: Union[dict, OrderedDict]) -> None:

        if not await self.image_exists(self._mount_image):
            await self.pull_image(self._mount_image)

        for k, v in files.items():
            mount = os.path.join(os.path.sep, mount)
            config = self._get_mount_config(volume, v, mount, k)
            container = await self.docker.containers.create_or_replace(
                config=config,
                name=volume)
            await container.start()
            await container.wait()
            await container.delete()

    async def volume_populate(
            self,
            container_type: str,
            name: str,
            mount: str,
            files: Union[dict, OrderedDict]):
        # create volume
        volume = await self.volume_create(
            container_type, name, mount)

        if files:
            # write files into the volume
            await self.volume_write(
                volume.name, mount, files)

        return volume

    def _get_mount_config(
            self,
            name: str,
            content: str,
            mount: str,
            target: str) -> dict:
        target = os.path.join(mount, target)
        return {
            'Image': self._mount_image,
            'Name': name,
            "Cmd": [
                'sh', '-c',
                f'echo \"$MOUNT_CONTENT\" | base64 -d > {target}'],
            "Env": [
                f"MOUNT_CONTENT={content}"],
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "NetworkDisabled": True,
            'HostConfig': {
                'AutoRemove': False,
                "Binds": [
                    f"{name}:{mount}"
                ],
            },
            "Labels": {
                "envoy.playground.temp.resource": "proxy",
                "envoy.playground.temp.mount": mount,
                "envoy.playground.temp.target": target,
            }}

    async def _get_volume_config(
            self,
            container_type: str,
            name: str,
            mount: str) -> dict:
        volume_name = f"envoy_playground__{container_type}__{name}__{mount}"
        return {
            "Name": volume_name,
            "Labels": {
                "envoy.playground.volume": name,
                "envoy.playground.volume.type": container_type,
                "envoy.playground.volume.mount": mount
            },
            "Driver": "local"
        }

    async def _list_resources(
            self,
            resources: Union[DockerContainers, DockerNetworks],
            name: str) -> list:
        _resources = []
        label = "%s.%s" % (self._envoy_label, name)
        for resource in await resources.list():
            if label not in resource["Labels"]:
                continue
            _resource = dict(
                name=resource["Labels"][label],
                id=resource["Id"][:10])

            # todo move these bits outa here
            if name == "proxy":
                _resource['image'] = resource['Image']
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
                _resource["service_type"] = resource["Labels"][
                    "envoy.playground.service.type"]

            if name == "network":
                _actual_network = await resources.get(resource["Id"])
                info = await _actual_network.show()
                if info["Containers"]:
                    _resource["containers"] = [
                        container[:10]
                        for container
                        in info["Containers"].keys()]

            _resources.append(_resource)
        return _resources
