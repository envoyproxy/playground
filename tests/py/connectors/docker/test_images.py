
from unittest.mock import AsyncMock, MagicMock

import pytest

import aiodocker

from playground.control.connectors.docker import client, images


class DummyPlaygroundClient(client.PlaygroundDockerClient):

    def __init__(self):
        self.docker = MagicMock()


def test_docker_images():
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)
    assert _images.connector == connector
    assert _images.docker == connector.docker


@pytest.mark.parametrize("inspect_raises", [True, False])
@pytest.mark.parametrize("build_raises", [True, False])
@pytest.mark.asyncio
async def test_docker_images_pull(
        patch_playground, build_raises, inspect_raises):
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)

    _patch_tag = patch_playground(
        'connectors.docker.images.PlaygroundDockerImages._image_tag')
    _patch_build = patch_playground(
        'connectors.docker.images.PlaygroundDockerImages._build',
        new_callable=AsyncMock)
    _patch_logger = patch_playground(
        'connectors.docker.images.logger')
    if inspect_raises:
        _images.docker.images.inspect = AsyncMock(
            side_effect=aiodocker.DockerError(
                'STATUS', dict(message='MESSAGE')))
    else:
        _images.docker.images.inspect = AsyncMock()

    with _patch_tag as m_tag:
        with _patch_build as m_build:
            with _patch_logger as m_logger:
                if build_raises:
                    m_build.side_effect = aiodocker.DockerError(
                        'STATUS', dict(message='MESSAGE'))
                if build_raises or inspect_raises:
                    assert not await _images.build('BUILD_FROM', 'IMAGE_TAG')
                else:
                    assert await _images.build('BUILD_FROM', 'IMAGE_TAG')
                assert (
                    list(m_logger.info.call_args)
                    == [(f"Building image: {m_tag.return_value} from "
                         f"{m_tag.return_value}",), {}])
                assert (
                    list(m_build.call_args)
                    == [(m_tag.return_value, m_tag.return_value), {}])
                assert (
                    list(list(c) for c in m_tag.call_args_list)
                    == [[('IMAGE_TAG',), {}],
                        [('BUILD_FROM',), {}]])
                if build_raises:
                    assert (
                        list(list(c) for c in m_logger.error.call_args_list)
                        == [[(f"Failed building image: {m_tag.return_value} "
                              f"from {m_tag.return_value} "
                              "\n DockerError(STATUS, 'MESSAGE')",), {}]])
                    assert not _images.docker.images.inspect.called
                else:
                    assert (
                        list(_images.docker.images.inspect.call_args)
                        == [(),
                            {'name': m_tag.return_value}])
                    if inspect_raises:
                        assert (
                            list(list(c)
                                 for c
                                 in m_logger.error.call_args_list)
                            == [[("Failed inspecting built image: "
                                  f"{m_tag.return_value} "
                                  "\n DockerError(STATUS, 'MESSAGE')",),
                                 {}]])
                    else:
                        assert not m_logger.error.called


TEST_IMAGES = (
    'foo',
    'foo:bar',
    'foo/latest',
    'foo:latest',
    'foo/bar',
    'foo/bar:latest')


@pytest.mark.parametrize("image", TEST_IMAGES)
def test_docker_images_image_tag(patch_playground, image):
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)
    result = _images._image_tag(image)
    assert ':' in result
    if ':' not in image:
        assert result.endswith(':latest')
