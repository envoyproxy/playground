# -*- coding: utf-8 -*-

import asyncio
import logging
from functools import cached_property
from typing import AsyncGenerator

from aiodocker import DockerError


logger = logging.getLogger(__file__)


class PlaygroundDockerEvents(object):

    # connector: PlaygroundDockerClient
    def __init__(self, connector):
        self.connector = connector
        self.docker = connector.docker
        self.publisher = None

    @cached_property
    def mapping(self):
        return dict(
            container=dict(
                action='Action',
                attributes='Actor/Attributes',
                id='id',
                status='status'),
            network=dict(
                action='Action',
                id='Actor/ID',
                name="Actor/Attributes/name",
                container="Actor/Attributes/container",
            ),
            image=dict(
                action='Action',
                image='Actor/Attributes/name'))

    async def __call__(self) -> AsyncGenerator[dict, None]:
        subscriber = self.docker.events.subscribe()
        while True:
            yield await subscriber.get()

    async def emit(self, debug: list = None) -> None:
        if not self.publisher:
            return
        async for event in self():
            await self._handle_event(event, debug)

    async def _handle_event(self, event, debug: list = None) -> None:
        event_type = event['Type']
        event_action = event['Action']
        if debug:
            print(f">>> EVENT ({event_type}:{event_action})")
        if debug and event_type in (debug or []):
            print(f">>> EVENT ({event_type})")
            print(event)
            print()
        _handler = getattr(self, f"_handle_{event['Type']}", None)
        if not _handler:
            return
        data = {}
        for k, v in self.mapping[event['Type']].items():
            item = event.get(v.split('/')[0])
            if not item:
                break
            data[k] = item
            for item in v.split('/')[1:]:
                v = data[k].get(item)
                if v:
                    data[k] = v
                else:
                    del data[k]
                    break
        event_type = (
            self._get_container_type(data)
            if event_type == 'container'
            else event_type)
        if event_type:
            await _handler(self.publisher[event_type], data)

    def _get_container_type(self, data):
        container_type = (
            'proxy'
            if "envoy.playground.proxy" in data['attributes']
            else ('service'
                  if "envoy.playground.service" in data['attributes']
                  else ''))
        return (
            container_type
            or data['attributes'].get(
                "envoy.playground.temp.resource"))

    async def _handle_container(self, publisher, data):
        data["name"] = (
            data['attributes']['name'].split('__')[2]
            if 'envoy.playground.temp.mount' in data['attributes']
            else data['attributes']["name"].split('__')[3])

        if data['action'] not in ['start', 'die']:
            await publisher(data)
            return

        # todo: think of a way to not try to fetch logs when container
        #   has been killed intentionally

        try:
            container = await self.connector.get_container(data['id'])
        except DockerError as e:
            # warn ?
            logger.warn(f'Failed finding image: {data["id"]} {e}')
            await publisher(data)
            return

        if data['action'] == 'die':
            try:
                data['logs'] = await container.log(stdout=True, stderr=True)
                await container.delete(force=True, v=True)
            except DockerError as e:
                logger.warn(
                    f'Failed deleting image: {data["name"]} {data["id"]} {e}',
                pass
            await publisher(data)
            return

        port_mappings = []

        if 'envoy.playground.proxy' in data['attributes']:
            ports = container['HostConfig']['PortBindings'] or {}
            data['image'] = self.connector.proxies._get_image_name(
                data['attributes']['image'])
            ports = container['HostConfig']['PortBindings'] or {}
            for container_port, mappings in ports.items():
                for mapping in mappings:
                    if mapping['HostPort']:
                        port_mappings.append(
                            dict(mapping_from=mapping['HostPort'],
                                 mapping_to=container_port.split('/')[0]))
        elif 'envoy.playground.service' in data['attributes']:
            data['service_type'] = container[
                'Config']['Labels']['envoy.playground.service.type']
        if port_mappings:
            data["port_mappings"] = port_mappings
        await publisher(data)

    async def _handle_image(self, publisher, data):
        if data['action'] in ['untag', 'delete']:
            return
        if ":" not in data['image']:
            data['image'] = f"{data['image']}:latest"
        await publisher(data)

    async def _handle_network(self, publisher, data):
        container = data.pop('container', None)
        target = None
        handlers = ["destroy", "create", "connect", "disconnect"]
        if data['action'] not in handlers:
            return
        if data['action'] == 'destroy':
            if not data['name'].startswith('__playground_'):
                return
        else:
            try:
                network = await self.connector.get_network(data['id'])
                info = await network.show()
            except DockerError as e:
                logger.warn(f'Failed finding network: {data["id"]} {e}')
                return
            if 'envoy.playground.network' not in info['Labels']:
                return
            data['containers'] = [
                container[:10]
                for container
                in info["Containers"].keys()]
        if container:
            try:
                target = await self.connector.get_container(container)
            except DockerError as e:
                logger.warn(f'Failed finding container for network: {container} {e}')
                return
        if target:
            if target['Name'].startswith('/envoy__playground__proxy__'):
                data['proxy'] = target['Name'].replace(
                    '/envoy__playground__proxy__', '')
            elif target['Name'].startswith('/envoy__playground__service__'):
                data['service'] = target['Name'].replace(
                    '/envoy__playground__service__', '')
            else:
                return
        data['name'] = data['name'].replace('__playground_', '')
        await publisher(data)

    async def publish(self, event_type, *args, **kwargs):
        if event_type == 'image_pull':
            image_tag = args[0]
            await self.publisher['image'](
                dict(action='pull_start',
                     image=image_tag))
        elif event_type == 'image_build':
            image_tag = args[0]
            await self.publisher['image'](
                dict(action='build_start',
                     image=image_tag))

    def subscribe(
            self,
            publisher: dict,
            debug: list = None) -> None:
        self.publisher = publisher
        asyncio.create_task(self.emit(debug=debug))
