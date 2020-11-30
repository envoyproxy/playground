# -*- coding: utf-8 -*-

import base64
from collections import OrderedDict

from playground.control.attribs import (
    ProxyCreateCommandAttribs, ProxyDeleteAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.base import PlaygroundDockerResources
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerProxies(PlaygroundDockerResources):
    _docker_resource = 'containers'
    name = 'proxy'

    @method_decorator(cmd(attribs=ProxyCreateCommandAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        # todo: add logging
        if not await self.connector.images.exists(command.data.image):
            await self.connector.images.pull(command.data.image)
        _mappings = [
            [m['mapping_from'], m['mapping_to']]
            for m
            in command.data.port_mappings]
        mounts = {
            "/etc/envoy": await self.connector.volumes.populate(
                'proxy',
                command.data.name,
                'envoy',
                {'envoy.yaml': base64.b64encode(
                    command.data.configuration.encode('utf-8')).decode()}),
            "/certs": await self.connector.volumes.populate(
                'proxy',
                command.data.name,
                'certs',
                command.data.certs.items()),
            '/binary': await self.connector.volumes.populate(
                'proxy',
                command.data.name,
                'binary',
                command.data.binaries.items()),
            '/logs': await self.connector.volumes.create(
                'proxy', command.data.name, 'logs')}
        container = await self.docker.containers.create_or_replace(
            config=self._get_proxy_config(
                command.data.image,
                command.data.name,
                mounts,
                _mappings),
            name="envoy__playground__proxy__%s" % command.data.name)
        await container.start()

    @method_decorator(cmd(attribs=ProxyDeleteAttribs))
    async def delete(
            self,
            command: PlaygroundCommand) -> None:
        # todo: use uuid
        for container in await self.docker.containers.list():
            if "envoy.playground.proxy" in container["Labels"]:
                name_matches = (
                    "/envoy__playground__proxy__%s" % command.data.name
                    in container["Names"])
                if name_matches:
                    volumes = [
                        v['Name']
                        for v in container['Mounts']]
                    await container.stop()
                    await container.wait()
                    await container.delete(v=True)
                    if volumes:
                        _volumes = await self.docker.volumes.list()
                        for volume in _volumes['Volumes']:
                            volume_name = volume['Name']
                            if volume_name not in volumes:
                                continue
                            volume_delete = self.docker._query(
                                    f"volumes/{volume_name}",
                                    method="DELETE")
                            async with volume_delete:
                                pass

    def _get_port_bindings(
            self,
            port_mappings: list) -> OrderedDict:
        port_bindings: OrderedDict = OrderedDict()
        for host, internal in port_mappings:
            port_bindings[f"{internal}/tcp"] = port_bindings.get(
                f"{internal}/tcp", [])
            port_bindings[f"{internal}/tcp"].append(
                {"HostPort": f"{host}"})
        return port_bindings

    def _get_proxy_config(
            self,
            image: str,
            name: str,
            mounts: dict,
            port_mappings: list) -> dict:
        # todo: handle udp etc
        return {
            'Image': image,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "Labels": {
                "envoy.playground.proxy": name,
            },
            "HostConfig": {
                "PortBindings": self._get_port_bindings(port_mappings),
                "Binds": [
                    '%s:%s' % (v.name, k)
                    for k, v
                    in mounts.items()]}}
