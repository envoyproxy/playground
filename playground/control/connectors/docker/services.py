
import base64
import os
from collections import OrderedDict

from playground.control.attribs import (
    ServiceCreateCommandAttribs, ServiceDeleteAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerServices(object):

    def __init__(self, connector):
        self.connector = connector

    async def clear(self):
        for service in await self.list():
            await self.delete(dict(name=service['name']))

    @method_decorator(cmd(attribs=ServiceCreateCommandAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        if not command.data.image:
            # todo: add build logic
            return
        if not await self.connector.image_exists(command.data.image):
            await self.connector.pull_image(command.data.image)
        mounts = OrderedDict()
        if command.data.configuration and command.data.config_path:
            config = base64.b64encode(
                command.data.configuration.encode('utf-8')).decode()
            mounts[os.path.dirname(command.data.config_path)] = (
                await self.connector.volume_populate(
                    'service',
                    command.data.name,
                    'config',
                    {os.path.basename(command.data.config_path): config}))
        _environment = [
            "%s=%s" % (k, v)
            for k, v
            in command.data.env.items()]
        container = await self.connector.docker.containers.create_or_replace(
            config=self._get_service_config(
                command.data.service_type,
                command.data.image,
                command.data.name,
                _environment,
                mounts),
            name="envoy__playground__service__%s" % command.data.name)
        await container.start()

    @method_decorator(cmd(attribs=ServiceDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        for container in await self.connector.docker.containers.list():
            if "envoy.playground.service" in container["Labels"]:
                name_matches = (
                    "/envoy__playground__service__%s" % command.data.name
                    in container["Names"])
                if name_matches:
                    volumes = [
                        v['Name']
                        for v in container['Mounts']]
                    await container.stop()
                    await container.wait()
                    await container.delete(v=True, force=True)
                    if volumes:
                        _volumes = await self.connector.docker.volumes.list()
                        for volume in _volumes['Volumes']:
                            volume_name = volume['Name']
                            if volume_name not in volumes:
                                continue
                            volume_delete = self.connector.docker._query(
                                    f"volumes/{volume_name}",
                                    method="DELETE")
                            async with volume_delete:
                                pass

    async def list(self) -> list:
        return await self.connector._list_resources(
            self.connector.docker.containers, "service")

    def _get_service_config(
            self,
            service_type: str,
            image: str,
            name: str,
            environment: list,
            mounts: dict) -> dict:
        labels = {
            "envoy.playground.service": name,
            "envoy.playground.service.type": service_type,
        }
        return {
            'Image': image,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "Env": environment,
            "Labels": labels,
            "HostConfig": {
                "Binds": [
                    '%s:%s' % (v.name, k)
                    for k, v
                    in mounts.items()]}}
