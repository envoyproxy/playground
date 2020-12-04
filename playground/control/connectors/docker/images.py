# -*- coding: utf-8 -*-

from typing import Union

import aiodocker

from playground.control.connectors.docker.base import PlaygroundDockerContext
from playground.control.utils import mktar_from_docker_context


class PlaygroundDockerImages(PlaygroundDockerContext):

    async def build(self, image_tag: str) -> Union[list, None]:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        try:
            tar_obj = mktar_from_docker_context('context')
            result = await self.docker.images.build(
                fileobj=tar_obj,
                encoding="gzip",
                tag=image_tag)
            tar_obj.close()
        except aiodocker.DockerError:
            return e.args
        try:
            await self.docker.images.inspect(name=image_tag)
        except aiodocker.DockerError:
            return result

    async def exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        for image in await self.docker.images.list():
            if image_tag in (image['RepoTags'] or []):
                return True
        return False

    async def pull(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.docker.images.pull(image_tag)
