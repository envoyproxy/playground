
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
            await _volumes.delete(['A', 'B', 'C'])
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


@pytest.mark.asyncio
async def test_docker_volumes_get_mount_command():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)

    assert (
        _volumes._get_mount_command('TARGET')
        == 'echo "$MOUNT_CONTENT" | base64 -d > TARGET')


@pytest.mark.asyncio
async def test_docker_volumes_get_mount_config():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    host_config = dict(CONF1='v1', CONF2='v2')
    env = ['ENV1', 'ENV2', 'ENV3']
    labels = dict(LABEL1='l1', LABEL2='l2')
    assert (
        _volumes._get_mount_config(
            'NAME',
            'COMMAND',
            host_config,
            env,
            labels)
        == {'Image': _volumes._mount_image,
            'Name': 'NAME',
            "Cmd": ['sh', '-c', 'COMMAND'],
            "Env": env,
            "AttachStdin": False,
            "AttachStdout": False,
            "AttachStderr": False,
            "Tty": False,
            "OpenStdin": False,
            "NetworkDisabled": True,
            'HostConfig': host_config,
            "Labels": labels})


@pytest.mark.asyncio
async def test_docker_volumes_get_mount_env():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    assert (
        _volumes._get_mount_env('CONTENT')
        == ["MOUNT_CONTENT=CONTENT"])


@pytest.mark.asyncio
async def test_docker_volumes_get_mount_host_config():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    assert (
        _volumes._get_mount_host_config('VOLUME', 'MOUNT')
        == {'AutoRemove': False,
            "Binds": [
                "VOLUME:MOUNT"]})


@pytest.mark.asyncio
async def test_docker_volumes_get_mount_labels():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    assert (
        _volumes._get_mount_labels(
            'CONTAINER_TYPE', 'NAME', 'MOUNT', 'TARGET')
        == {"envoy.playground.temp.resource": 'CONTAINER_TYPE',
            "envoy.playground.temp.mount": 'MOUNT',
            "envoy.playground.temp.target": 'MOUNT/TARGET',
            "envoy.playground.temp.name": 'NAME'})


@pytest.mark.asyncio
async def test_docker_volumes_get_volume_config():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    labels = dict(LABEL1='l1', LABEL2='l2')
    assert (
        _volumes._get_volume_config(labels)
        == {"Labels": labels,
            "Driver": "local"})


@pytest.mark.asyncio
async def test_docker_volumes_get_volume_labels():
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)
    assert (
        _volumes._get_volume_labels(
            'CONTAINER_TYPE', 'NAME', 'MOUNT')
        == {"envoy.playground.volume": 'NAME',
            "envoy.playground.volume.type": 'CONTAINER_TYPE',
            "envoy.playground.volume.mount": 'MOUNT',
            "envoy.playground.volume.name": 'NAME'})


@pytest.mark.asyncio
async def test_docker_volumes_write_volume(patch_playground):
    connector = DummyPlaygroundClient()
    _volumes = volumes.PlaygroundDockerVolumes(connector)

    _patch_config = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_mount_config')
    _patch_command = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_mount_command')
    _patch_host = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes'
        '._get_mount_host_config')
    _patch_env = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_mount_env')
    _patch_labels = patch_playground(
        'connectors.docker.volumes.PlaygroundDockerVolumes._get_mount_labels')

    _volumes.docker.containers.create_or_replace = AsyncMock()
    _create = _volumes.docker.containers.create_or_replace

    with _patch_config as m_config:
        with _patch_command as m_command:
            with _patch_host as m_host:
                with _patch_env as m_env:
                    with _patch_labels as m_labels:
                        await _volumes._write_volume(
                            'NAME',
                            'VOLUME',
                            'MOUNT',
                            'CONTAINER_TYPE',
                            'FNAME',
                            'CONTENT')
                        assert (
                            list(m_labels.call_args)
                            == [('CONTAINER_TYPE',
                                 'NAME',
                                 'MOUNT',
                                 'FNAME'), {}])
                        assert (
                            list(m_env.call_args)
                            == [('CONTENT',), {}])
                        assert (
                            list(m_host.call_args)
                            == [('VOLUME', 'MOUNT'), {}])
                        assert (
                            list(m_command.call_args)
                            == [('MOUNT/FNAME',), {}])
                        assert (
                            list(m_config.call_args)
                            == [('VOLUME',
                                 m_command.return_value,
                                 m_host.return_value,
                                 m_env.return_value,
                                 m_labels.return_value, ),
                                {}])
                        assert (
                            list(_create.call_args)
                            == [(),
                                {'name': 'VOLUME',
                                 'config': m_config.return_value}])
                        assert (
                            list(_create.return_value.start.call_args)
                            == [(), {}])
                        assert (
                            list(_create.return_value.wait.call_args)
                            == [(), {}])
                        assert (
                            list(_create.return_value.delete.call_args)
                            == [(), {}])
