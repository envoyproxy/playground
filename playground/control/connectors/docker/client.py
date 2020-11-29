
import base64
import os
from collections import OrderedDict
from typing import Union

import aiodocker
from aiodocker.containers import DockerContainers
from aiodocker.networks import DockerNetworks

from playground.control.attribs import (
    NetworkAddAttribs, NetworkDeleteAttribs,
    NetworkEditAttribs,
    ProxyCreateCommandAttribs, ProxyDeleteAttribs,
    ServiceCreateCommandAttribs, ServiceDeleteAttribs)
from playground.control.command import PlaygroundCommand
from playground.control.connectors.docker.events import PlaygroundDockerEvents
from playground.control.decorators import cmd, method_decorator


# TODO: split network/service/proxy classes/instances out
class PlaygroundDockerClient(object):
    _envoy_label = "envoy.playground"
    _mount_image = "busybox"

    def __init__(self):
        self.docker = aiodocker.Docker()
        self.events = PlaygroundDockerEvents(self.docker)

    @method_decorator(cmd)
    async def clear(self) -> list:
        resources = (
            (self.list_services, self.service_delete),
            (self.list_proxies, self.proxy_delete),
            (self.list_networks, self.network_delete))
        for _resources, remove in resources:
            for resource in await _resources():
                await remove(resource['name'])

    @method_decorator(cmd(sync=True))
    async def dump_resources(self) -> list:
        proxies = OrderedDict()
        for proxy in await self.list_proxies():
            proxies[proxy["name"]] = proxy

        networks = OrderedDict()
        for network in await self.list_networks():
            networks[network["name"]] = network

        services = OrderedDict()
        for service in await self.list_services():
            services[service["name"]] = service
        return dict(
            networks=networks,
            proxies=proxies,
            services=services)

    async def get_container(self, id: str):
        return await self.docker.containers.get(id)

    async def get_network(self, id: str):
        return await self.docker.networks.get(id)

    async def image_exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        for image in await self.docker.images.list():
            if image_tag in (image['RepoTags'] or []):
                return True
        return False

    async def list_networks(self) -> list:
        return await self._list_resources(
            self.docker.networks, "network")

    async def list_proxies(self) -> list:
        return await self._list_resources(
            self.docker.containers, "proxy")

    async def list_services(self) -> list:
        return await self._list_resources(
            self.docker.containers, "service")

    @method_decorator(cmd(attribs=NetworkAddAttribs))
    async def network_create(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.docker.networks.create(
            dict(name="__playground_%s" % command.data.name,
                 labels={"envoy.playground.network": command.data.name}))
        if command.data.proxies:
            for proxy in await self.list_proxies():
                if proxy['name'] in command.data.proxies:
                    await network.connect({"Container": proxy["id"]})
        if command.data.services:
            for service in await self.list_services():
                if service['name'] in command.data.services:
                    await network.connect({"Container": service["id"]})

    @method_decorator(cmd(attribs=NetworkDeleteAttribs))
    async def network_delete(
            self,
            command: PlaygroundCommand) -> None:
        for network in await self.docker.networks.list():
            if "envoy.playground.network" in network["Labels"]:
                if network["Name"] == "__playground_%s" % command.data.name:
                    _network = await self.docker.networks.get(network["Id"])
                    info = await _network.show()
                    for container in info["Containers"].keys():
                        await _network.disconnect({"Container": container})
                    await _network.delete()

    @method_decorator(cmd(attribs=NetworkEditAttribs))
    async def network_edit(
            self,
            command: PlaygroundCommand) -> None:
        network = await self.docker.networks.get(command.data.id)
        info = await network.show()
        containers = {
            container['Name'].replace(
                'envoy__playground__service__', '').replace(
                    'envoy__playground__proxy__', '')
            for container
            in info["Containers"].values()}
        expected = (
            set(command.data.proxies or [])
            | set(command.data.services or []))
        connect = expected - containers
        disconnect = containers - expected
        for proxy in await self.list_proxies():
            if proxy['name'] in connect:
                await network.connect({"Container": proxy["id"]})
            if proxy['name'] in disconnect:
                await network.disconnect({"Container": proxy["id"]})
        for service in await self.list_services():
            if service['name'] in connect:
                await network.connect({"Container": service["id"]})
            if service['name'] in disconnect:
                await network.disconnect({"Container": service["id"]})

    @method_decorator(cmd(attribs=ProxyCreateCommandAttribs))
    async def proxy_create(
            self,
            command: PlaygroundCommand) -> None:
        # todo: add logging
        if not await self.image_exists(command.data.image):
            await self.pull_image(command.data.image)
        _mappings = [
            [m['mapping_from'], m['mapping_to']]
            for m
            in command.data.port_mappings]
        mounts = {
            "/etc/envoy": await self.volume_populate(
                'proxy',
                command.data.name,
                'envoy',
                {'envoy.yaml': base64.b64encode(
                    command.data.configuration.encode('utf-8')).decode()}),
            "/certs": await self.volume_populate(
                'proxy',
                command.data.name,
                'certs',
                command.data.certs.items()),
            '/binary': await self.volume_populate(
                'proxy',
                command.data.name,
                'binary',
                command.data.binaries.items()),
            '/logs': await self.volume_create(
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
    async def proxy_delete(
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

    async def pull_image(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.docker.images.pull(image_tag)

    @method_decorator(cmd(attribs=ServiceCreateCommandAttribs))
    async def service_create(
            self,
            command: PlaygroundCommand) -> None:
        if not command.data.image:
            # todo: add build logic
            return
        if not await self.image_exists(command.data.image):
            await self.pull_image(command.data.image)
        mounts = OrderedDict()
        if command.data.configuration and command.data.config_path:
            config = base64.b64encode(
                command.data.configuration.encode('utf-8')).decode()
            mounts[os.path.dirname(command.data.config_path)] = (
                await self.volume_populate(
                    'service',
                    command.data.name,
                    'config',
                    {os.path.basename(command.data.config_path): config}))
        _environment = [
            "%s=%s" % (k, v)
            for k, v
            in command.data.env.items()]
        container = await self.docker.containers.create_or_replace(
            config=self._get_service_config(
                command.data.service_type,
                command.data.image,
                command.data.name,
                _environment,
                mounts),
            name="envoy__playground__service__%s" % command.data.name)
        await container.start()

    @method_decorator(cmd(attribs=ServiceDeleteAttribs))
    async def service_delete(
            self,
            command: PlaygroundCommand) -> None:
        for container in await self.docker.containers.list():
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

    async def volume_create(
            self,
            container_type: str,
            name: str,
            mount: str) -> None:
        volume_config = await self._get_volume_config(
            container_type, name, mount)
        return await self.docker.volumes.create(volume_config)

    async def volume_write(
            self,
            volume: str,
            mount: str,
            files: Union[dict, OrderedDict]) -> None:

        if not await self.image_exists(self._mount_image):
            await self.pull_image(self._mount_image)

        for k, v in files.items():
            mount = os.path.join(os.path.sep, mount)
            config = self._get_mount_config(volume, v, mount, k)
            container = await self.docker.containers.create_or_replace(
                config=config,
                name=volume)
            await container.start()
            await container.wait()
            await container.delete()

    async def volume_populate(
            self,
            container_type: str,
            name: str,
            mount: str,
            files: Union[dict, OrderedDict]):
        # create volume
        volume = await self.volume_create(
            container_type, name, mount)

        if files:
            # write files into the volume
            await self.volume_write(
                volume.name, mount, files)

        return volume

    def _get_mount_config(
            self,
            name: str,
            content: str,
            mount: str,
            target: str) -> dict:
        target = os.path.join(mount, target)
        return {
            'Image': self._mount_image,
            'Name': name,
            "Cmd": [
                'sh', '-c',
                f'echo \"$MOUNT_CONTENT\" | base64 -d > {target}'],
            "Env": [
                f"MOUNT_CONTENT={content}"],
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "NetworkDisabled": True,
            'HostConfig': {
                'AutoRemove': False,
                "Binds": [
                    f"{name}:{mount}"
                ],
            },
            "Labels": {
                "envoy.playground.temp.resource": "proxy",
                "envoy.playground.temp.mount": mount,
                "envoy.playground.temp.target": target,
            }}

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

    async def _get_volume_config(
            self,
            container_type: str,
            name: str,
            mount: str) -> dict:
        volume_name = f"envoy_playground__{container_type}__{name}__{mount}"
        return {
            "Name": volume_name,
            "Labels": {
                "envoy.playground.volume": name,
                "envoy.playground.volume.type": container_type,
                "envoy.playground.volume.mount": mount
            },
            "Driver": "local"
        }

    async def _list_resources(
            self,
            resources: Union[DockerContainers, DockerNetworks],
            name: str) -> list:
        _resources = []
        label = "%s.%s" % (self._envoy_label, name)
        for resource in await resources.list():
            if label not in resource["Labels"]:
                continue
            _resource = dict(
                name=resource["Labels"][label],
                id=resource["Id"][:10])

            # todo move these bits outa here
            if name == "proxy":
                _resource['image'] = resource['Image']
                _resource['port_mappings'] = [
                    {'mapping_from': m.get('PublicPort'),
                     'mapping_to': m.get('PrivatePort')}
                    for m
                    in resource['Ports']
                    if m.get('PublicPort')]
                if not _resource['port_mappings']:
                    del _resource['port_mappings']

            if name == "service":
                _resource['image'] = resource['Image']
                _resource["service_type"] = resource["Labels"][
                    "envoy.playground.service.type"]

            if name == "network":
                _actual_network = await resources.get(resource["Id"])
                info = await _actual_network.show()
                if info["Containers"]:
                    _resource["containers"] = [
                        container[:10]
                        for container
                        in info["Containers"].keys()]

            _resources.append(_resource)
        return _resources
