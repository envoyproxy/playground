# -*- coding: utf-8 -*-

import logging
import os
from collections import OrderedDict
from typing import Union

from aiodocker import DockerError

from playground.control.connectors.docker.base import PlaygroundDockerContext


logger = logging.getLogger(__file__)


class PlaygroundDockerVolumes(PlaygroundDockerContext):
    _mount_image = "busybox"

    async def create(
            self,
            container_type: str,
            name: str,
            mount: str) -> None:
        config = await self._get_config(
            container_type, name, mount)
        try:
            logger.warn(f'Creating volume: {config}')
            return await self.docker.volumes.create(config)
        except DockerError as e:
            logger.warn(f'Error creating volume: {config} {e}')

    async def write(
            self,
            volume: str,
            mount: str,
            container_type: str,
            files: Union[dict, OrderedDict]) -> None:

        if not await self.connector.images.exists(self._mount_image):
            await self.connector.images.pull(self._mount_image)

        for k, v in files.items():
            mount = os.path.join(os.path.sep, mount)
            config = self._get_mount_config(
                container_type, volume, v, mount, k)
            container = await self.docker.containers.create_or_replace(
                config=config,
                name=volume)
            await container.start()
            await container.wait()
            await container.delete()

    async def populate(
            self,
            container_type: str,
            name: str,
            mount: str,
            files: Union[dict, OrderedDict]):
        volume = await self.create(container_type, name, mount)

        if files:
            # write files into the volume
            await self.write(volume.name, mount, container_type, files)
        return volume

    async def _get_config(
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

    def _get_mount_config(
            self,
            container_type: str,
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
                "envoy.playground.temp.resource": container_type,
                "envoy.playground.temp.mount": mount,
                "envoy.playground.temp.target": target,
            }}
