
from unittest.mock import AsyncMock, MagicMock

import pytest

import aiodocker

from playground.control.connectors.docker import client, volumes


class DummyPlaygroundClient(client.PlaygroundDockerClient):

    def __init__(self):
        self.docker = MagicMock()


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


@pytest.mark.parametrize("raises", [True, False])
@pytest.mark.asyncio
async def test_docker_volumes_create(patch_playground, raises):
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)

    _patch_config = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_volume_config')
    _patch_labels = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_volume_labels')
    _patch_logger = patch_playground(
        'connectors.docker.volumes.logger')

    if raises:
        connector.docker.volumes.create = AsyncMock(
            side_effect=aiodocker.DockerError(
                'STATUS', dict(message='MESSAGE')))
    else:
        connector.docker.volumes.create = AsyncMock()

    with _patch_config as m_config:
        with _patch_labels as m_labels:
            with _patch_logger as m_logger:
                response = await _volumes.create(
                    'CONTAINER_TYPE', 'NAME', 'MOUNT')
                if raises:
                    assert not response
                else:
                    assert (
                        response
                        == connector.docker.volumes.create.return_value.name)
                assert (
                    list(connector.docker.volumes.create.call_args)
                    == [(m_config.return_value,), {}])
                assert (
                    list(m_config.call_args)
                    == [(m_labels.return_value,), {}])
                assert (
                    list(m_labels.call_args)
                    == [('CONTAINER_TYPE', 'NAME', 'MOUNT'), {}])
                assert (
                    list(m_logger.debug.call_args)
                    == [('Creating volume: (CONTAINER_TYPE/NAME): MOUNT',),
                        {}])
                if raises:
                    assert (
                        list(m_logger.error.call_args)
                        == [("Failed creating volume: (CONTAINER_TYPE/NAME): "
                             "MOUNT DockerError(STATUS, 'MESSAGE')",), {}])
                else:
                    assert not m_logger.error.called


@pytest.mark.parametrize("raises", [True, False])
@pytest.mark.asyncio
async def test_docker_volumes_delete(patch_playground, raises):
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)

    _patch_docker = patch_playground(
        'connectors.docker.volumes.aiodocker.volumes')
    _patch_logger = patch_playground(
        'connectors.docker.volumes.logger')

    with _patch_docker as m_docker:
        with _patch_logger as m_logger:
            _DockerVolume = m_docker.DockerVolume
            if raises:
                _DockerVolume.return_value.delete = AsyncMock(
                    side_effect=aiodocker.DockerError(
                        'STATUS', dict(message='MESSAGE')))
            else:
                _DockerVolume.return_value.delete = AsyncMock()
            response = await _volumes.delete(['A', 'B', 'C'])
            assert (
                list(list(c) for c in _DockerVolume.call_args_list)
                == [[(_volumes.docker, 'A'), {}],
                    [(_volumes.docker, 'B'), {}],
                    [(_volumes.docker, 'C'), {}]])
            _delete = _DockerVolume.return_value.delete
            assert (
                list(list(c) for c in _delete.call_args_list)
                == [[(), {}], [(), {}], [(), {}]])
            if raises:
                msg = (
                    "Failed deleting volume: "
                    "{name} DockerError(STATUS, 'MESSAGE')")
                assert (
                    list(list(c) for c in m_logger.error.call_args_list)
                    == [[(msg.format(name='A'),), {}],
                        [(msg.format(name='B'),), {}],
                        [(msg.format(name='C'),), {}]])
            else:
                assert not m_logger.error.called
