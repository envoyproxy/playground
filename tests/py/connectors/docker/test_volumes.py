
from unittest.mock import AsyncMock

import pytest

import aiodocker

from playground.control.connectors.docker import client, volumes


class DummyPlaygroundClient(client.PlaygroundDockerClient):

    def __init__(self):
        self.docker = 'DOCKER'


@pytest.mark.asyncio
async def test_docker_volumes():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    assert _volumes.connector == connector
    assert _volumes.docker == connector.docker


VOLUME_POPULATE_TESTS = (
    ('VOLUME', dict()),
    ('VOLUME', dict(foo='BAR')),
    ('VOLUME', dict(foo='BAR', bar="BAZ")),
    ('', dict(foo='BAR', bar="BAZ")),
    ('', dict()))


@pytest.mark.parametrize("created,files", VOLUME_POPULATE_TESTS)
@pytest.mark.asyncio
async def test_docker_volumes_populate(patch_playground, created, files):
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)

    _patch_create = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes.create',
        new_callable=AsyncMock)
    _patch_write = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes.write',
        new_callable=AsyncMock)

    with _patch_create as m_create:
        with _patch_write as m_write:
            m_create.return_value = created
            response = await _volumes.populate(
                'CONTAINER_TYPE', 'NAME', 'MOUNT', files)
            assert (
                list(m_create.call_args)
                == [('CONTAINER_TYPE', 'NAME', 'MOUNT'), {}])
            if not files or not created:
                assert not m_write.called
            else:
                assert (
                    list(m_write.call_args)
                    == [('NAME',
                         'VOLUME',
                         'MOUNT',
                         'CONTAINER_TYPE',
                         files), {}])
            assert response == created
