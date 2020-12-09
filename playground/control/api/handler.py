# -*- coding: utf-8 -*-

from aiodocker.exceptions import DockerError

from playground.control.attribs import (
    ContainerEventAttribs,
    ImageEventAttribs,
    NetworkEventAttribs)
from playground.control.decorators import handler, method_decorator
from playground.control.event import PlaygroundEvent


class PlaygroundEventHandler(object):

    def __init__(self, api):
        self.api = api
        self.connector = api.connector
        self.handler = dict(
            errors=self.handle_errors,
            image=self.handle_image,
            proxy=self.handle_proxy,
            service=self.handle_service,
            network=self.handle_network)
        self.debug = []

    @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle_proxy(
            self,
            event: PlaygroundEvent) -> None:
        await self._handle_container('proxy', event)

    @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle_service(
            self,
            event: PlaygroundEvent) -> None:
        await self._handle_container('service', event)

    # @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle_errors(
            self,
            message: str) -> None:
        await self.api.publish(dict(playtime_errors=[message]))

    @method_decorator(handler(attribs=ImageEventAttribs))
    async def handle_image(
            self,
            event: PlaygroundEvent) -> None:
        # print('IMAGE EVENT!', event)
        if event.data.action in ['pull_start', 'build_start']:
            await self.api.publish(
                dict(type='image',
                     image=event.data.image,
                     status=event.data.action))

    @method_decorator(handler(attribs=NetworkEventAttribs))
    async def handle_network(
            self,
            event: PlaygroundEvent) -> None:
        handlers = ["destroy", "create", "connect", "disconnect"]
        if event.data.action in handlers:
            await getattr(
                self,
                'handle_network_%s' % event.data.action)(
                    event)

    async def handle_network_connect(
            self,
            event: PlaygroundEvent) -> None:
        nid = event.data.id
        network = await self.connector.get_network(nid)
        info = await network.show()
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            _event = dict(
                type="network",
                action=event.data.action,
                name=event.data.name,
                networks={
                    name: dict(
                        name=name, id=nid[:10],
                        containers=containers)})
            if event.data.proxy:
                _event['proxy'] = event.data.proxy
            if event.data.service:
                _event['service'] = event.data.service
            await self.api.publish(_event)

    async def handle_network_create(
            self,
            event: PlaygroundEvent) -> None:
        name = event.data.name
        nid = event.data.id
        # todo: move this to connector
        network = await self.connector.get_network(nid)
        info = await network.show()
        name = info["Labels"]["envoy.playground.network"]
        if "envoy.playground.network" not in info["Labels"]:
            return
        await self.api.publish(
            dict(type="network",
                 action=event.data.action,
                 name=event.data.name,
                 networks={name: dict(name=name, id=nid[:10])}))

    async def handle_network_destroy(
            self,
            event: PlaygroundEvent) -> None:
        await self.api.publish(
            dict(type="network",
                 name=event.data.name,
                 action=event.data.action,
                 id=event.data.id[:10]))

    async def handle_network_disconnect(
            self,
            event: PlaygroundEvent) -> None:
        name = event.data.name
        nid = event.data.id
        try:
            network = await self.connector.get_network(nid)
            info = await network.show()
        except DockerError:
            return
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            _event = dict(
                type="network",
                action=event.data.action,
                name=event.data.name,
                networks={
                    name: dict(
                        name=name, id=nid[:10],
                        containers=containers)})
            if event.data.proxy:
                _event['proxy'] = event.data.proxy
            if event.data.service:
                _event['service'] = event.data.service
            await self.api.publish(_event)

    async def _handle_container(
            self,
            resource: str,
            event: PlaygroundEvent) -> None:
        handlers = ["destroy", "start", "die"]
        if event.data.action not in handlers:
            return
        is_volume_container = (
            "envoy.playground.temp.resource"
            in event.data.attributes)
        (await getattr(
            self,
            f'_handle_container_{event.data.action}')(
                resource, event)
         if not is_volume_container
         else await self._handle_container_volume(resource, event))

    async def _handle_container_die(
            self,
            resource: str,
            event: PlaygroundEvent) -> None:
        try:
            # todo: think of a way to not try to fetch logs when container
            #   has been killed intentionally
            container = await self.connector.get_container(event.data.id)
            logs = await container.log(stdout=True, stderr=True)
            await container.delete(force=True, v=True)
        except DockerError:
            # most likely been killed
            logs = []
        await self.api.publish(
            dict(type=resource,
                 id=event.data.id[:10],
                 logs=logs,
                 name=event.data.attributes["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event.data.status))

    async def _handle_container_destroy(
            self,
            resource: str,
            event: PlaygroundEvent) -> None:
        await self.api.publish(
            dict(type=resource,
                 id=event.data.id[:10],
                 name=event.data.attributes["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event.data.status))

    async def _handle_container_start(
            self,
            resource: str,
            event: PlaygroundEvent) -> None:
        container = await self.connector.get_container(event.data.id)
        to_publish = dict(
            type=resource,
            id=event.data.id[:10],
            image=event.data.attributes['image'],
            name=event.data.attributes["name"].replace(
                f'envoy__playground__{resource}__', ''),
            status=event.data.status)
        port_mappings = []
        if resource == 'proxy':
            ports = container['HostConfig']['PortBindings'] or {}
            for container_port, mappings in ports.items():
                for mapping in mappings:
                    if mapping['HostPort']:
                        port_mappings.append(
                            dict(mapping_from=mapping['HostPort'],
                                 mapping_to=container_port.split('/')[0]))
        else:
            to_publish['service_type'] = container[
                'Config']['Labels']['envoy.playground.service.type']
        if port_mappings:
            to_publish["port_mappings"] = port_mappings
        await self.api.publish(to_publish)

    async def _handle_container_volume(
            self,
            resource: str,
            event: PlaygroundEvent) -> None:
        if event.data.status != 'start':
            return
        await self.api.publish(
            dict(type=resource,
                 name=event.data.attributes["name"].split('__')[2],
                 status='volume_create'))

    def subscribe(self):
        self.connector.subscribe(self.handler, debug=self.debug)
