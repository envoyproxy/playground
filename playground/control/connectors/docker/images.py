# -*- coding: utf-8 -*-

import io
import os
import tarfile
import tempfile
from typing import IO, Union

import aiodocker

from playground.control.connectors.docker.base import PlaygroundDockerContext


# based on util in aiodocker for single file
def mktar_from_docker_context(path: str) -> IO:
    """
    Create a zipped tar archive from a Docker context
    **Remember to close the file object**
    Args:
        fileobj: a Dockerfile
    Returns:
        a NamedTemporaryFile() object
    """
    f = tempfile.NamedTemporaryFile()
    t = tarfile.open(mode="w:gz", fileobj=f)

    for name in os.listdir(path):
        # todo: handle dir recursion properly
        if name.endswith('~'):
            continue
        fpath = os.path.join(path, name)
        with open(fpath) as _f:
            fileobject = io.BytesIO(_f.read().encode("utf-8"))
            f_mode = int(oct(os.stat(fpath).st_mode)[-3:])
        dfinfo = tarfile.TarInfo(name)
        dfinfo.size = len(fileobject.getvalue())
        dfinfo.mode = f_mode
        fileobject.seek(0)
        t.addfile(dfinfo, fileobject)
    t.close()
    f.seek(0)
    return f


class PlaygroundDockerImages(PlaygroundDockerContext):

    async def build(self, image_tag: str) -> Union[list, None]:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"

        tar_obj = mktar_from_docker_context('context')
        result = await self.docker.images.build(
            fileobj=tar_obj,
            encoding="gzip",
            tag=image_tag)
        tar_obj.close()
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
