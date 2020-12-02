# -*- coding: utf-8 -*-

import base64
from collections import OrderedDict

from playground.control.attribs import (
    ProxyCreateCommandAttribs)
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
        # todo: add logging and error handling
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
        # todo: add error handling
        await self._start_container(
            self._get_proxy_config(
                command.data.image,
                command.data.name,
                command.data.logging,
                mounts,
                _mappings),
            command.data.name)

    def _get_port_bindings(
            self,
            port_mappings: list) -> OrderedDict:
        # todo: handle udp etc
        port_bindings: OrderedDict = OrderedDict()
        for host, internal in port_mappings:
            port_bindings[f"{internal}/tcp"] = port_bindings.get(
                f"{internal}/tcp", [])
            port_bindings[f"{internal}/tcp"].append(
                {"HostPort": f"{host}"})
        return port_bindings

    def _get_proxy_cmd(
            self,
            logging: dict) -> list:
        return (
            ["envoy", "-c", "/etc/envoy/envoy.yaml"]
            if logging.get("default", "info") in ['', "info"]
            else ["envoy",
                  "-c", "/etc/envoy/envoy.yaml",
                  '-l', logging.get('default')])

    def _get_proxy_config(
            self,
            image: str,
            name: str,
            logging: dict,
            mounts: dict,
            port_mappings: list) -> dict:
        return {
            'Image': image,
            'Cmd': self._get_proxy_cmd(logging),
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
