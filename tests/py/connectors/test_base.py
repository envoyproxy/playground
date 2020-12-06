
from unittest.mock import MagicMock

from playground.control.connectors.docker import base


def test_docker_base_context():
    connector = MagicMock()
    context = base.PlaygroundDockerContext(connector)
    assert context.connector is connector
    assert context.docker == connector.docker
