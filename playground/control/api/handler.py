
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
            image=self.handle_image,
            container=self.handle_container,
            network=self.handle_network)
        self.debug = []

    @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle_container(
            self,
            event: PlaygroundEvent) -> None:
        handlers = ["destroy", "start", "die"]
        if event.data.action not in handlers:
            return
        is_playground_container = set([
            "envoy.playground.proxy",
            "envoy.playground.service"]).intersection(
                event.data.attributes)
        is_proxy_create_container = (
            "envoy.playground.temp.resource" in event.data.attributes
            and event.data.status == 'start')
        if is_playground_container:
            await getattr(
                self,
                'handle_container_%s' % event.data.action)(event)
        elif is_proxy_create_container:
            await self.handle_proxy_creation(event)

    async def handle_container_die(
            self,
            event: PlaygroundEvent) -> None:
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event.data.attributes
            else "service")
        container = await self.connector.get_container(event.data.id)
        try:
            logs = await container.log(stdout=True, stderr=True)
            await container.delete(force=True, v=True)
        except DockerError:
            # most likely been killed
            logs = []
        await self.api.publish(
            dict(type="container",
                 resource=resource,
                 id=event.data.id[:10],
                 logs=logs,
                 name=event.data.attributes["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event.data.status))

    async def handle_container_destroy(
            self,
            event: PlaygroundEvent) -> None:
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event.data.attributes
            else "service")
        await self.api.publish(
            dict(type="container",
                 resource=resource,
                 id=event.data.id[:10],
                 name=event.data.attributes["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event.data.status))

    async def handle_container_start(
            self,
            event: PlaygroundEvent) -> None:
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event.data.attributes
            else "service")
        container = await self.connector.get_container(event.data.id)
        to_publish = dict(
            type="container",
            resource=resource,
            id=event.data.id[:10],
            image=event.data.attributes['image'],
            name=event.data.attributes["name"].replace(
                f'envoy__playground__{resource}__', ''),
            status=event.data.status)
        ports = container['HostConfig']['PortBindings'] or {}
        port_mappings = []
        for container_port, mappings in ports.items():
            for mapping in mappings:
                if mapping['HostPort']:
                    port_mappings.append(
                        dict(mapping_from=mapping['HostPort'],
                             mapping_to=container_port.split('/')[0]))
        if port_mappings:
            to_publish["port_mappings"] = port_mappings
        await self.api.publish(
            to_publish)

    @method_decorator(handler(attribs=ImageEventAttribs))
    async def handle_image(
            self,
            event: PlaygroundEvent) -> None:
        if event.data.action == 'pull':
            # todo: if image is one configured for envoy or services
            #  then emit a signal to ui. This will be more useful
            #  when socket events are fixed.
            pass

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
            await self.api.publish(
                dict(type="network",
                     action=event.data.action,
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_network_create(
            self,
            event: PlaygroundEvent) -> None:
        name = event.data.name
        nid = event.data.id
        network = await self.connector.get_network(nid)
        info = await network.show()
        name = info["Labels"]["envoy.playground.network"]
        if "envoy.playground.network" not in info["Labels"]:
            return
        await self.api.publish(
            dict(type="network",
                 action=event.data.action,
                 networks={name: dict(name=name, id=nid[:10])}))

    async def handle_network_destroy(
            self,
            event: PlaygroundEvent) -> None:
        await self.api.publish(
            dict(type="network",
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
            await self.api.publish(
                dict(type="network",
                     action=event.data.action,
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_proxy_creation(
            self,
            event: PlaygroundEvent) -> None:
        await self.api.publish(
            dict(type="container",
                 resource=event.data.attributes["name"].split('__')[1],
                 name=event.data.attributes["name"].split('__')[2],
                 status='creating'))

    def subscribe(self):
        self.connector.events.subscribe(self.handler, debug=self.debug)
