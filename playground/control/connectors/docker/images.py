# -*- coding: utf-8 -*-

import logging
from typing import Union

import aiodocker

from playground.control.connectors.docker.base import PlaygroundDockerContext
from playground.control.utils import mktar_from_docker_context


logger = logging.getLogger(__name__)


class PlaygroundDockerImages(PlaygroundDockerContext):

    async def build(
            self,
            build_from: str,
            image_tag: str) -> Union[list, None]:
        image_tag = self._image_tag(image_tag)
        build_from = self._image_tag(build_from)
        logger.info(
            f'Building image: {image_tag} from {build_from}')
        try:
            await self._build(build_from, image_tag)
        except aiodocker.DockerError as e:
            logger.error(
                f'Failed building image: {image_tag} from {build_from} \n {e}')
            return
        try:
            await self.docker.images.inspect(name=image_tag)
        except aiodocker.DockerError as e:
            logger.error(
                f'Failed inspecting built image: {image_tag} \n {e}')
        else:
            return True

    async def exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        image_tag = self._image_tag(image_tag)
        logger.debug(f'Checking for image ({image_tag})')
        try:
            images = await self.docker.images.list(filter=image_tag)
            return bool([
                _result
                for _result
                in images
                if image_tag in _result['RepoTags']])
        except aiodocker.DockerError as e:
            logger.error(
                f'Failed checking for image ({image_tag}): {e}')

    async def pull(self, image_tag: str, force: bool = False) -> None:
        image_tag = self._image_tag(image_tag)
        if not force and await self.exists(image_tag):
            return True
        logger.info(f'Pulling image {image_tag}')
        try:
            await self.docker.images.pull(image_tag)
        except aiodocker.DockerError as e:
            logger.error(f'Failed pulling image: {image_tag} {e}')
        else:
            return True

    def _image_tag(self, image_tag):
        return (
            image_tag
            if ":" in image_tag
            else f"{image_tag}:latest")

    async def _build(self, build_from, image_tag):
        tar_obj = mktar_from_docker_context('context')
        result = None
        try:
            result = await self.docker.images.build(
                fileobj=tar_obj,
                encoding="gzip",
                buildargs=dict(BUILD_FROM=build_from),
                tag=image_tag)
        finally:
            tar_obj.close()
        return result
