
from unittest.mock import AsyncMock, MagicMock

import pytest

from playground.control.connectors.docker import client
from playground.control.api.endpoint import PlaygroundAPI


class DummyPlaygroundClient(client.PlaygroundDockerClient):

    def __init__(self):
        self.networks = MagicMock()
        self.proxies = MagicMock()
        self.services = MagicMock()


class DummyPlaygroundAPI(PlaygroundAPI):

    def __init__(self):
        pass


def test_docker_client(patch_playground):
    _patch_aiodocker = patch_playground(
        'connectors.docker.client.aiodocker.Docker')
    _patch_images = patch_playground(
        'connectors.docker.client.PlaygroundDockerImages')
    _patch_volumes = patch_playground(
        'connectors.docker.client.PlaygroundDockerVolumes')
    _patch_proxies = patch_playground(
        'connectors.docker.client.PlaygroundDockerProxies')
    _patch_services = patch_playground(
        'connectors.docker.client.PlaygroundDockerServices')
    _patch_networks = patch_playground(
        'connectors.docker.client.PlaygroundDockerNetworks')
    _patch_events = patch_playground(
        'connectors.docker.client.PlaygroundDockerEvents')

    def _run_test(
            m_aiodocker, m_images, m_volumes, m_proxies,
            m_services, m_networks, m_events):
        api = DummyPlaygroundAPI()
        _connector = client.PlaygroundDockerClient(api)
        assert _connector.api == api
        assert _connector.docker == m_aiodocker.return_value
        assert (
            list(m_aiodocker.call_args)
            == [(), {}])
        assert _connector.images == m_images.return_value
        assert (
            list(m_images.call_args)
            == [(_connector, ), {}])
        assert _connector.volumes == m_volumes.return_value
        assert (
            list(m_volumes.call_args)
            == [(_connector, ), {}])
        assert _connector.proxies == m_proxies.return_value
        assert (
            list(m_proxies.call_args)
            == [(_connector, ), {}])
        assert _connector.services == m_services.return_value
        assert (
            list(m_services.call_args)
            == [(_connector, ), {}])
        assert _connector.networks == m_networks.return_value
        assert (
            list(m_networks.call_args)
            == [(_connector, ), {}])
        assert (
            list(m_events.call_args)
            == [((_connector), ), {}])

    with _patch_aiodocker as m_aiodocker:
        with _patch_images as m_images:
            with _patch_volumes as m_volumes:
                with _patch_proxies as m_proxies:
                    with _patch_services as m_services:
                        with _patch_networks as m_networks:
                            with _patch_events as m_events:
                                _run_test(
                                    m_aiodocker, m_images, m_volumes,
                                    m_proxies, m_services, m_networks,
                                    m_events)


@pytest.mark.asyncio
async def test_docker_client_clear():
    client = DummyPlaygroundClient()
    client.networks.clear = AsyncMock()
    client.proxies.clear = AsyncMock()
    client.services.clear = AsyncMock()
    await client.clear.__wrapped__(client)
    assert (
        list(client.networks.clear.call_args)
        == [(), {}])
    assert (
        list(client.proxies.clear.call_args)
        == [(), {}])
    assert (
        list(client.services.clear.call_args)
        == [(), {}])


@pytest.mark.asyncio
async def test_docker_dump_resources():
    client = DummyPlaygroundClient()
    client.networks.list = AsyncMock(
        return_value=[dict(name=f"NET{i}", foo=i) for i in range(3)])
    client.proxies.list = AsyncMock(
        return_value=[dict(name=f"CLIENT{i}", foo=i) for i in range(3)])
    client.services.list = AsyncMock(
        return_value=[dict(name=f"SERVICE{i}", foo=i) for i in range(3)])
    response = await client.dump_resources.__wrapped__(client)
    assert (
        list(client.proxies.list.call_args)
        == [(), {}])
    assert (
        list(client.networks.list.call_args)
        == [(), {}])
    assert (
        list(client.services.list.call_args)
        == [(), {}])
    assert (
        response
        == {'networks':
            {'NET0': {'name': 'NET0', 'foo': 0},
             'NET1': {'name': 'NET1', 'foo': 1},
             'NET2': {'name': 'NET2', 'foo': 2}},
            'proxies':
            {'CLIENT0': {'name': 'CLIENT0', 'foo': 0},
             'CLIENT1': {'name': 'CLIENT1', 'foo': 1},
             'CLIENT2': {'name': 'CLIENT2', 'foo': 2}},
            'services':
            {'SERVICE0': {'name': 'SERVICE0', 'foo': 0},
             'SERVICE1': {'name': 'SERVICE1', 'foo': 1},
             'SERVICE2': {'name': 'SERVICE2', 'foo': 2}}})
