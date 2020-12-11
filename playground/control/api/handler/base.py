# -*- coding: utf-8 -*-

from aiodocker import DockerError

from playground.control.attribs import ContainerEventAttribs
from playground.control.event import PlaygroundEvent
from playground.control.decorators import handler, method_decorator


class BasePlaygroundEventHandler(object):

    def __init__(self, handler):
        self.handler = handler


class PlaygroundContainerEventHandler(BasePlaygroundEventHandler):

    @method_decorator(handler(attribs=ContainerEventAttribs))
    async def handle(
            self,
            event: PlaygroundEvent) -> None:
        await self._handle(event)

    async def publish(self, data):
        raise NotImplementedError

    async def _handle(
            self,
            event: PlaygroundEvent) -> None:
        handlers = ["destroy", "start", "die"]
        if event.data.action not in handlers:
            return
        is_volume_container = (
            "envoy.playground.temp.resource"
            in event.data.attributes)
        (await getattr(
            self,
            event.data.action)(event)
         if not is_volume_container
         else await self.volume(event))

    async def destroy(
            self,
            event: PlaygroundEvent) -> None:
        await self._publish(event)

    async def die(
            self,
            event: PlaygroundEvent) -> None:
        try:
            # todo: think of a way to not try to fetch logs when container
            #   has been killed intentionally
            container = await self.handler.connector.get_container(
                event.data.id)
            logs = await container.log(stdout=True, stderr=True)
            await container.delete(force=True, v=True)
        except DockerError:
            # most likely been killed
            logs = []
        await self._publish(event, dict(logs=logs))

    async def start(
            self,
            event: PlaygroundEvent) -> None:
        container = await self.handler.connector.get_container(event.data.id)
        to_publish = dict(image=event.data.attributes['image'])
        port_mappings = []
        if 'envoy.playground.proxy' in event.data.attributes:
            # todo: move this outta here
            ports = container['HostConfig']['PortBindings'] or {}
            proxies = self.handler.connector.proxies
            to_publish['image'] = proxies._get_image_name(
                event.data.attributes['image'])
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
        await self._publish(event, to_publish)

    async def volume(
            self,
            event: PlaygroundEvent) -> None:
        if event.data.status != 'start':
            return
        await self._publish(event, dict(status='volume_create'))

    async def _publish(
            self,
            event: PlaygroundEvent,
            data: dict = None) -> None:
        _event = dict(
            name=event.data.name,
            id=event.data.id[:10],
            status=event.data.status)
        _event.update(data or {})
        await self.publish(_event)
