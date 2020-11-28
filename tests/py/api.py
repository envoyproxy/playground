
from playground.control import api

from utils import _patch


def test_api():
    _patch_docker = _patch('api.PlaygroundDockerClient')

    with _patch_docker as m_docker:
        _api = api.PlaygroundAPI()
        assert _api.connector = m_docker.return_value
        assert (
            list(m_docker.call_args)
            == [(), {}])
