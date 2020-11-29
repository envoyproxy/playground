
from typing import Union
from aiodocker.containers import DockerContainers
from aiodocker.networks import DockerNetworks


class PlaygroundDockerContext(object):

    def __init__(self, connector):
        self.connector = connector
        self.docker = connector.docker


class PlaygroundDockerResources(PlaygroundDockerContext):

    async def clear(self):
        for resource in await self.list():
            await self.delete(dict(name=resource['name']))

    async def list(self) -> list:
        return await self._list_resources(
            getattr(self.docker, self._docker_resource),
            self.name)

    async def _list_resources(
            self,
            resources: Union[DockerContainers, DockerNetworks],
            name: str) -> list:
        _resources = []
        label = "%s.%s" % (self.connector._envoy_label, name)
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
