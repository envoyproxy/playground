# -*- coding: utf-8 -*-

import logging
import os

import aiodocker

from playground.control.connectors.docker.base import PlaygroundDockerContext


logger = logging.getLogger(__name__)


class PlaygroundDockerVolumes(PlaygroundDockerContext):
    _mount_image = "busybox"

    async def create(
            self,
            container_type: str,
            name: str,
            mount: str) -> str:
        info = f'({container_type}/{name}): {mount}'
        logger.debug(f'Creating volume: {info}')
        try:
            volume = await self.docker.volumes.create(
                self._get_volume_config(
                    self._get_volume_labels(
                        container_type,
                        name,
                        mount)))
            return volume.name
        except aiodocker.DockerError as e:
            logger.error(f'Failed creating volume: {info} {e}')

    async def delete(
            self,
            names: list) -> None:
        for name in names:
            try:
                await aiodocker.volumes.DockerVolume(
                    self.docker, name).delete()
            except aiodocker.DockerError as e:
                logger.error(f'Failed deleting volume: {name} {e}')

    async def populate(
            self,
            container_type: str,
            name: str,
            mount: str,
            files: dict) -> aiodocker.volumes.DockerVolume:
        volume = await self.create(container_type, name, mount)
        if volume and files:
            await self.write(
                name,
                volume,
                mount,
                container_type,
                files)
        return volume

    async def write(
            self,
            name: str,
            volume: str,
            mount: str,
            container_type: str,
            files: dict) -> None:
        await self.connector.images.pull(self._mount_image)
        for fname, content in files.items():
            mount = os.path.join(os.path.sep, mount)
            info = f'({container_type}/{name}): {mount}/{fname}'
            logger.debug(f'Writing volume {info}')
            try:
                await self._write_volume(
                    name,
                    volume,
                    mount,
                    container_type,
                    fname,
                    content)
            except aiodocker.DockerError as e:
                logger.error(
                    f'Failed writing to volume {info} {e}')

    def _get_mount_command(self, target: str) -> str:
        return f'echo \"$MOUNT_CONTENT\" | base64 -d > {target}'

    def _get_mount_config(
            self,
            name: str,
            command: str,
            host_config: dict,
            env: list,
            labels: dict) -> dict:
        return {
            'Image': self._mount_image,
            'Name': name,
            "Cmd": ['sh', '-c', command],
            "Env": env,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "NetworkDisabled": True,
            'HostConfig': host_config,
            "Labels": labels}

    def _get_mount_env(self, content: str) -> list:
        return [f"MOUNT_CONTENT={content}"]

    def _get_mount_host_config(self, volume: str, mount: str) -> dict:
        return {
            'AutoRemove': False,
            "Binds": [
                f"{volume}:{mount}"]}

    def _get_mount_labels(
            self,
            container_type: str,
            name: str,
            mount: str,
            target: str) -> dict:
        return {
            "envoy.playground.temp.resource": container_type,
            "envoy.playground.temp.mount": mount,
            "envoy.playground.temp.target": os.path.join(mount, target),
            "envoy.playground.temp.name": name}

    def _get_volume_config(
            self,
            labels: dict) -> dict:
        return {
            "Labels": labels,
            "Driver": "local"}

    def _get_volume_labels(
            self,
            container_type: str,
            name: str,
            mount: str) -> dict:
        return {
            "envoy.playground.volume": name,
            "envoy.playground.volume.type": container_type,
            "envoy.playground.volume.mount": mount,
            "envoy.playground.volume.name": name}

    async def _write_volume(
            self,
            name: str,
            volume: str,
            mount: str,
            container_type: str,
            fname: str,
            content: str) -> None:
        container = await self.docker.containers.create_or_replace(
            name=volume,
            config=self._get_mount_config(
                volume,
                self._get_mount_command(os.path.join(mount, fname)),
                self._get_mount_host_config(volume, mount),
                self._get_mount_env(content),
                self._get_mount_labels(
                    container_type, name, mount, fname)))
        await container.start()
        await container.wait()
        await container.delete()
