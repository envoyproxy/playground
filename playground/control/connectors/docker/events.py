# -*- coding: utf-8 -*-

import asyncio
from typing import AsyncGenerator


class PlaygroundDockerEvents(object):

    # connector: PlaygroundDockerClient
    def __init__(self, connector):
        self.connector = connector
        self.docker = connector.docker
        self.publisher = None

    @property
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
            data[k] = event[v.split('/')[0]]
            for item in v.split('/')[1:]:
                data[k] = data[k][item]
        event_type = (
            self._get_container_type(data)
            if event['Type'] == 'container'
            else event['Type'])
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
        await publisher(data)

    async def _handle_image(self, publisher, data):
        if data['action'] in ['untag', 'delete']:
            return
        if ":" not in data['image']:
            data['image'] = f"{data['image']}:latest"
        await publisher(data)

    async def _handle_network(self, publisher, data):
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
