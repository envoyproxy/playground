
from playground.control.connectors.docker import client


def test_docker_client(patch_playground):
    _patch_events = patch_playground(
        'connectors.docker.client.PlaygroundDockerEvents')
    _patch_aiodocker = patch_playground(
        'connectors.docker.client.aiodocker.Docker')

    with _patch_events as m_events:
        with _patch_aiodocker as m_aiodocker:
            _connector = client.PlaygroundDockerClient()
            assert _connector.docker == m_aiodocker.return_value
            assert (
                list(m_events.call_args)
                == [((m_aiodocker.return_value), ), {}])
