# -*- coding: utf-8 -*-

import base64
import logging
from collections import OrderedDict

from playground.control.attribs import ProxyCreateCommandAttribs
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.base import PlaygroundDockerResources
from playground.control.decorators import cmd, method_decorator


logger = logging.getLogger(__name__)


class PlaygroundDockerProxies(PlaygroundDockerResources):
    _docker_resource = 'containers'
    name = 'proxy'

    @method_decorator(cmd(attribs=ProxyCreateCommandAttribs))
    async def create(
            self,
            command: PlaygroundCommand) -> None:
        logger.debug(
            f'Creating proxy: {command.data.name}')
        use_dev = (
            not command.data.version
            or command.data.version.startswith('envoy-dev'))
        image = (
            'envoyproxy/envoy-dev'
            if use_dev
            else 'envoyproxy/envoy')
        tag = (
            command.data.version.split(':')[1]
            if ':' in command.data.version
            else 'latest')
        base_image = f'{image}:{tag}'
        envoy_image = (
            f"envoyproxy/{base_image.split('/')[1].split(':')[0]}"
            f"-playground:{base_image.split(':')[1]}")
        should_pull = (
            command.data.pull_latest
            or not await self.connector.images.exists(envoy_image))
        if should_pull:
            errors = await self.connector.images.pull(base_image)
            if not errors:
                errors = await self.connector.images.build(
                    base_image, envoy_image)
            if errors:
                # todo: publish failure
                print('FAILED BUILDING IMAGE')
                print(errors)
                return
        _mappings = [
            [m['mapping_from'], m['mapping_to']]
            for m
            in command.data.port_mappings]
        # todo: add error handling
        await self._start_container(
            self._get_proxy_config(
                envoy_image,
                command.data.name,
                command.data.logging,
                await self._get_mounts(command.data),
                _mappings),
            command.data.name)

    async def _get_mounts(
            self,
            data: ProxyCreateCommandAttribs) -> dict:
        return {
            "/etc/envoy": await self.connector.volumes.populate(
                'proxy',
                data.name,
                'envoy',
                {'envoy.yaml': base64.b64encode(
                    data.configuration.encode('utf-8')).decode()}),
            "/certs": await self.connector.volumes.populate(
                'proxy',
                data.name,
                'certs',
                data.certs),
            '/binary': await self.connector.volumes.populate(
                'proxy',
                data.name,
                'binary',
                data.binaries),
            '/logs': await self.connector.volumes.create(
                'proxy', data.name, 'logs')}

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

    def _get_proxy_config(
            self,
            image: str,
            name: str,
            logging: dict,
            mounts: dict,
            port_mappings: list) -> dict:
        environment = (
            []
            if logging.get("default", "info") in ['', "info"]
            else [f"ENVOY_LOG_LEVEL={logging['default']}"])
        exposed = {
            f"{internal}/tcp": {}
            for external, internal
            in port_mappings}
        return {
            'Image': image,
            'Cmd': ["python", "/hot-restarter.py", "/start_envoy.sh"],
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "Labels": {
                "envoy.playground.proxy": name,
            },
            "Env": environment,
            "ExposedPorts": exposed,
            "HostConfig": {
                "PortBindings": self._get_port_bindings(port_mappings),
                "Binds": [
                    '%s:%s' % (v.name, k)
                    for k, v
                    in mounts.items()]}}

    async def _mangle_resource(self, resource, _resource):
        _resource['image'] = self._get_image_name(resource['Image'])
        _resource['port_mappings'] = [
            {'mapping_from': m.get('PublicPort'),
             'mapping_to': m.get('PrivatePort')}
            for m
            in resource['Ports']
            if m.get('PublicPort')]
        if not _resource['port_mappings']:
            del _resource['port_mappings']
