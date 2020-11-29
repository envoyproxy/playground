
import aiodocker

from playground.control.connectors.docker import events


class DummyDocker(aiodocker.Docker):

    def __init__(self):
        # do nothing
        pass


def test_docker_client():
    docker = DummyDocker()
    _events = events.PlaygroundDockerEvents(docker)
    assert _events.docker == docker
