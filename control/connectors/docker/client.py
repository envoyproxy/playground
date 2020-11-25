
import os
from collections import OrderedDict
from typing import Optional, Union

import aiodocker
from aiodocker.containers import DockerContainers
from aiodocker.networks import DockerNetworks

from connectors.docker.events import PlaygroundDockerEvents


class PlaygroundDockerClient(object):
    _envoy_image = "envoyproxy/envoy-dev:latest"
    _envoy_label = "envoy.playground"
    _mount_image = "busybox"

    def __init__(self):
        self.client = aiodocker.Docker()
        self.events = PlaygroundDockerEvents(self.client)

    async def get_network(self, name: str):
        return await self._get_resource(
            self.client.networks, "network",  name)

    async def list_networks(self) -> list:
        return await self._list_resources(
            self.client.networks, "network")

    async def list_proxies(self) -> list:
        return await self._list_resources(
            self.client.containers, "proxy")

    async def list_services(self) -> list:
        return await self._list_resources(
            self.client.containers, "service")

    async def write_volume(
            self,
            volume: str,
            mount: str,
            files: Union[dict, OrderedDict]) -> None:

        if not await self.image_exists(self._mount_image):
            await self.pull_image(self._mount_image)

        for k, v in files.items():
            mount = os.path.join(os.path.sep, mount)
            config = self._get_mount_config(volume, v, mount, k)
            container = await self.client.containers.create_or_replace(
                config=config,
                name=volume)
            await container.start()
            await container.wait()
            await container.delete()

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

    async def create_volume(
            self,
            container_type: str,
            name: str,
            mount: str) -> None:
        volume_config = await self._get_volume_config(
            container_type, name, mount)
        return await self.client.volumes.create(volume_config)

    async def remove_volume(
            self,
            container_type: str,
            name: str,
            mount: str) -> None:
        volume_name = f"envoy_playground__{container_type}__{name}__{mount}"
        delete_context = self.client._query(
            f"volumes/{volume_name}",
            method="DELETE")
        async with delete_context:
            pass

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

    async def create_proxy(
            self,
            name: str,
            mounts: dict,
            mappings: list,
            logging: dict) -> None:
        container = await self.client.containers.create_or_replace(
            config=self._get_proxy_config(
                name,
                mounts,
                mappings),
            name=name)
        await container.start()

    async def create_network(
            self,
            name: str,
            proxies: Optional[list] = None,
            services: Optional[list] = None) -> None:
        network = await self.client.networks.create(
            dict(name="__playground_%s" % name,
                 labels={"envoy.playground.network": name}))
        if proxies:
            for proxy in await self.list_proxies():
                if proxy['name'] in proxies:
                    await network.connect({"Container": proxy["id"]})
        if services:
            for service in await self.list_services():
                if service['name'] in services:
                    await network.connect({"Container": service["id"]})

    async def edit_network(
            self,
            id: str,
            proxies: Optional[list] = None,
            services: Optional[list] = None) -> None:
        network = await self.client.networks.get(id)
        info = await network.show()
        containers = {
            container['Name']
            for container
            in info["Containers"].values()}
        expected = set(proxies) | set(services)
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

    async def image_exists(self, image_tag: str) -> bool:
        # this is not v efficient, im wondering if there is a way to search.
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        for image in await self.client.images.list():
            if image_tag in (image['RepoTags'] or []):
                return True
        return False

    async def pull_image(self, image_tag: str) -> None:
        if ":" not in image_tag:
            image_tag = f"{image_tag}:latest"
        await self.client.images.pull(image_tag)

    async def create_service(
            self,
            name: str,
            service_config: dict,
            service_type: str,
            mounts: dict,
            aliases=None) -> None:
        image = service_config.get("image")
        if not image:
            # todo: add build logic
            return
        environment = [
            "%s=%s" % (k, v)
            for k, v
            in service_config.get("environment", {}).items()]

        container = await self.client.containers.create_or_replace(
            config=self._get_service_config(
                service_type,
                image,
                name,
                environment,
                mounts),
            name=name)
        await container.start()

    async def delete_network(self, name: str) -> None:
        for network in await self.client.networks.list():
            if "envoy.playground.network" in network["Labels"]:
                if network["Name"] == "__playground_%s" % name:
                    _network = await self.client.networks.get(network["Id"])
                    info = await _network.show()
                    for container in info["Containers"].keys():
                        await _network.disconnect({"Container": container})
                    await _network.delete()

    async def delete_proxy(self, name: str) -> None:
        for container in await self.client.containers.list():
            if "envoy.playground.proxy" in container["Labels"]:
                if "/%s" % name in container["Names"]:
                    await container.stop()
                    await container.delete()

    async def delete_service(self, name: str) -> None:
        for container in await self.client.containers.list():
            if "envoy.playground.service" in container["Labels"]:
                if "/%s" % name in container["Names"]:
                    await container.stop()
                    await container.delete()

    async def _get_resource(
            self,
            resources: dict,
            resource_type: str,
            name: str) -> dict:
        resource = await resources.get("__playground_%s" % name)
        content = await resource.show()
        return dict(name=name, id=content["Id"][:10])

    def _get_proxy_config(
            self,
            name: str,
            mounts: dict,
            port_mappings: list) -> dict:
        # todo: handle udp etc
        port_bindings = OrderedDict(
            (f"{internal}/tcp", [{"HostPort": f"{host}"}])
            for host, internal
            in port_mappings)
        return {
            'Image': self._envoy_image,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "Labels": {
                "envoy.playground.proxy": name,
            },
            "HostConfig": {
                "PortBindings": port_bindings,
                "Binds": [
                    '%s:%s' % (v.name, k)
                    for k, v
                    in mounts.items()]}}

    def _get_service_config(
            self,
            service_type,
            image: str,
            name: str,
            environment: dict,
            mounts: dict) -> dict:
        return {
            'Image': image,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "Env": environment,
            "Labels": {
                "envoy.playground.service": name,
                "envoy.playground.service.type": service_type,
            },
            "HostConfig": {
                "Binds": [
                    '%s:%s' % (v.name, k)
                    for k, v
                    in mounts.items()]}}

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
                    in resource['Ports']]

            if name == "service":
                _resource['image'] = resource['Image']
                _resource["service_type"] = resource["Labels"][
                    "envoy.playground.service.type"]

            if name == "network":
                _actual_network = await resources.get(resource["Id"])
                info = await _actual_network.show()
                _resource["containers"] = [
                    container[:10]
                    for container
                    in info["Containers"].keys()]

            _resources.append(_resource)
        return _resources
