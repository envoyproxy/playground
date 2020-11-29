
from collections import OrderedDict
from typing import Union

import aiodocker
from aiodocker.containers import DockerContainers
from aiodocker.networks import DockerNetworks

from playground.control.connectors.docker.events import (
    PlaygroundDockerEvents)
from playground.control.connectors.docker.images import (
    PlaygroundDockerImages)
from playground.control.connectors.docker.networks import (
    PlaygroundDockerNetworks)
from playground.control.connectors.docker.proxies import (
    PlaygroundDockerProxies)
from playground.control.connectors.docker.services import (
    PlaygroundDockerServices)
from playground.control.connectors.docker.volumes import (
    PlaygroundDockerVolumes)
from playground.control.decorators import cmd, method_decorator


class PlaygroundDockerClient(object):
    _envoy_label = "envoy.playground"

    def __init__(self):
        self.docker = aiodocker.Docker()
        self.images = PlaygroundDockerImages(self)
        self.volumes = PlaygroundDockerVolumes(self)
        self.proxies = PlaygroundDockerProxies(self)
        self.services = PlaygroundDockerServices(self)
        self.networks = PlaygroundDockerNetworks(self)
        self.events = PlaygroundDockerEvents(self.docker)

    @method_decorator(cmd)
    async def clear(self) -> list:
        await self.networks.clear()
        await self.proxies.clear()
        await self.services.clear()

    @method_decorator(cmd(sync=True))
    async def dump_resources(self) -> list:
        proxies = OrderedDict()
        for proxy in await self.proxies.list():
            proxies[proxy["name"]] = proxy

        networks = OrderedDict()
        for network in await self.networks.list():
            networks[network["name"]] = network

        services = OrderedDict()
        for service in await self.services.list():
            services[service["name"]] = service
        return dict(
            networks=networks,
            proxies=proxies,
            services=services)

    async def get_container(self, id: str):
        return await self.docker.containers.get(id)

    async def get_network(self, id: str):
        return await self.docker.networks.get(id)

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
