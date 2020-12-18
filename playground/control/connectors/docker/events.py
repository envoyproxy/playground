# -*- coding: utf-8 -*-

import asyncio
import logging
from functools import cached_property
from typing import AsyncGenerator

from aiodocker import DockerError


logger = logging.getLogger(__name__)


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

    async def _handle_volume_container(self, data):
        if data['action'] not in ['start']:
            return
        _data = {}
        _data['action'] = 'volume_create'
        _data['status'] = 'volume_create'
        name = data['attributes'].get(
            'envoy.playground.temp.name', '')
        if ':' in name:
            _data['service_type'] = name.split(':')[0]
            _data['name'] = name.split(':')[1]
        else:
            _data['name'] = name
        _data['attributes'] = {}
        _data['id'] = '23'
        publisher = self.publisher[
            data['attributes']['envoy.playground.temp.resource']]
        await publisher(_data)

    async def _handle_container(self, publisher, data):
        if '__' not in data['attributes']['name']:
            await self._handle_volume_container(data)
            return
        data["name"] = (
            data['attributes']['name'].split('__')[2]
            if 'envoy.playground.temp.mount' in data['attributes']
            else data['attributes']["name"].split('__')[3])

        if data['action'] not in ['start', 'die']:
            await publisher(data)
            return

        try:
            container = await self.connector.get_container(data['id'])
        except DockerError as e:
            logger.warn(f'Failed finding image: {data["id"]} {e}')
            await publisher(data)
            return

        is_volume_container = (
            'envoy.playground.temp.resource'
            in container['Config']['Labels'])
        logs_needed = (
            data['action'] == 'die'
            and not is_volume_container
            and container['State']['ExitCode'] == 1)
        if logs_needed:
            try:
                data['logs'] = await container.log(stdout=True, stderr=True)
            except DockerError as e:
                logger.warn(
                    f'Failed fetching logs: {data["name"]} {data["id"]} {e}')
            try:
                data['logs'] = await container.log(stdout=True, stderr=True)
                await container.delete(force=True, v=True)
                volumes = [
                    v['Name']
                    for v
                    in container.__dict__['_container']['Mounts']]
                await self.connector.volumes.delete(volumes)
            except DockerError as e:
                logger.warn(
                    f'Failed deleting image: {data["name"]} {data["id"]} {e}')
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
                logger.warn(
                    f'Failed finding container for network: {container} {e}')
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
            image_tag = args[2]
            await self.publisher[args[0]](
                dict(action='pull_start',
                     status='pull_start',
                     name=args[1],
                     id='23',
                     attributes={},
                     image=image_tag))
        elif event_type == 'image_build':
            image_tag = args[1]
            await self.publisher['proxy'](
                dict(action='build_start',
                     id='23',
                     name=args[0],
                     attributes={},
                     status='build_start',
                     build_from=args[2],
                     image=image_tag))

    def subscribe(
            self,
            publisher: dict,
            debug: list = None) -> None:
        self.publisher = publisher
        asyncio.create_task(self.emit(debug=debug))
