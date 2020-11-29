

class PlaygroundDockerImages(object):

    def __init__(self, connector):
        self.connector = connector

    async def exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        for image in await self.connector.docker.images.list():
            if image_tag in (image['RepoTags'] or []):
                return True
        return False

    async def pull(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.connector.docker.images.pull(image_tag)
