# -*- coding: utf-8 -*-

import base64
import os
from collections import OrderedDict

from playground.control.attribs import ServiceCreateCommandAttribs
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.base import PlaygroundDockerResources
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerServices(PlaygroundDockerResources):
    _docker_resource = 'containers'
    name = 'service'

    @method_decorator(cmd(attribs=ServiceCreateCommandAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        if not command.data.image:
            # todo: add build logic
            return
        if not await self.connector.images.exists(command.data.image):
            await self.connector.images.pull(command.data.image)
        mounts = OrderedDict()
        if command.data.configuration and command.data.config_path:
            config = base64.b64encode(
                command.data.configuration.encode('utf-8')).decode()
            mounts[os.path.dirname(command.data.config_path)] = (
                await self.connector.volumes.populate(
                    'service',
                    command.data.name,
                    'config',
                    {os.path.basename(command.data.config_path): config}))
        _environment = [
            "%s=%s" % (k, v)
            for k, v
            in command.data.env.items()]
        await self._start_container(
            self._get_service_config(
                command.data.service_type,
                command.data.image,
                command.data.name,
                _environment,
                mounts),
            command.data.name)

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
