# -*- coding: utf-8 -*-

import asyncio
from typing import AsyncGenerator

import aiodocker


class PlaygroundDockerEvents(object):

    def __init__(self, docker: aiodocker.Docker):
        self.docker = docker

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
                action='Action'))

    async def __call__(self) -> AsyncGenerator[dict, None]:
        subscriber = self.docker.events.subscribe()
        while True:
            yield await subscriber.get()

    async def emit(self, publisher: dict, debug: list = None) -> None:
        async for event in self():
            event_type = event['Type']
            event_action = event['Action']
            if debug:
                print(f">>> EVENT ({event_type}:{event_action})")
            if debug and event_type in (debug or []):
                print(f">>> EVENT ({event_type})")
                print(event)
                print()
            if publisher.get(event['Type']):
                data = {}
                for k, v in self.mapping[event['Type']].items():
                    data[k] = event[v.split('/')[0]]
                    for item in v.split('/')[1:]:
                        data[k] = data[k][item]
                await publisher[event['Type']](data)

    def subscribe(
            self,
            publisher: dict,
            debug: list = None) -> None:
        asyncio.create_task(self.emit(publisher, debug=debug))
