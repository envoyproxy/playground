# -*- coding: utf-8 -*-

from typing import Union

import aiodocker

from playground.control.connectors.docker.base import PlaygroundDockerContext
from playground.control.utils import mktar_from_docker_context


class PlaygroundDockerImages(PlaygroundDockerContext):

    async def build(self, image_tag: str) -> Union[list, None]:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.connector.events.publish(
            'image_build', image_tag)
        try:
            tar_obj = mktar_from_docker_context('context')
            result = await self.docker.images.build(
                fileobj=tar_obj,
                encoding="gzip",
                tag=image_tag)
            tar_obj.close()
        except aiodocker.DockerError as e:
            return e.args
        try:
            await self.docker.images.inspect(name=image_tag)
        except aiodocker.DockerError:
            return result

    async def exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        return bool(await self.docker.images.list(filter=image_tag))

    async def pull(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.connector.events.publish('image_pull', image_tag)
        await self.docker.images.pull(image_tag)
