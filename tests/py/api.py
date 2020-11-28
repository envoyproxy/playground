
from playground.control import api


def test_api(patch_playground):
    _patch_docker = patch_playground('api.PlaygroundDockerClient')

    with _patch_docker as m_docker:
        _api = api.PlaygroundAPI()
        assert _api.connector == m_docker.return_value
        assert (
            list(m_docker.call_args)
            == [(), {}])
