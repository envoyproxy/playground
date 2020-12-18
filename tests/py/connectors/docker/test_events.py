
import pytest

import aiodocker

from playground.control.connectors.docker import client, events


class DummyPlaygroundClient(client.PlaygroundDockerClient):

    def __init__(self):
        self.docker = 'DOCKER'


@pytest.mark.asyncio
async def test_docker_events():
    connector = DummyPlaygroundClient()
    _events = events.PlaygroundDockerEvents(connector)
    assert _events.connector == connector
    assert _events.docker == connector.docker
