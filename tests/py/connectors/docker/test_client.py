
from playground.control.connectors.docker import client


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
        _connector = client.PlaygroundDockerClient()
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
            == [((m_aiodocker.return_value), ), {}])

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
