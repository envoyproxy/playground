
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


@pytest.mark.parametrize("force", [True, False])
@pytest.mark.parametrize("exists", [True, False])
@pytest.mark.parametrize("raises", [True, False])
@pytest.mark.asyncio
async def test_docker_images_pull(patch_playground, force, exists, raises):
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)

    _patch_tag = patch_playground(
        'connectors.docker.images.PlaygroundDockerImages._image_tag')
    _patch_exists = patch_playground(
        'connectors.docker.images.PlaygroundDockerImages.exists',
        new_callable=AsyncMock)
    _patch_logger = patch_playground(
        'connectors.docker.images.logger')
    if raises:
        _images.docker.images.pull = AsyncMock(
            side_effect=aiodocker.DockerError(
                'STATUS', dict(message='MESSAGE')))
    else:
        _images.docker.images.pull = AsyncMock()

    with _patch_tag as m_tag:
        with _patch_exists as m_exists:
            with _patch_logger as m_logger:
                m_exists.return_value = exists
                response = await _images.pull('IMAGE', force=force)

                assert (
                    list(m_tag.call_args)
                    == [('IMAGE',), {}])

                if force:
                    assert not m_exists.called
                else:
                    assert (
                        list(m_exists.call_args)
                        == [(m_tag.return_value,), {}])
                if not force and exists:
                    assert not m_logger.info.called
                    assert not m_logger.error.called
                    assert not _images.docker.images.pull.called
                    assert response
                    return
                assert (
                    list(m_logger.info.call_args)
                    == [(f"Pulling image {m_tag.return_value}",), {}])
                assert (
                    list(_images.docker.images.pull.call_args)
                    == [(m_tag.return_value,), {}])
                if raises:
                    assert not response
                    assert (
                        list(m_logger.error.call_args)
                        == [(f"Failed pulling image: {m_tag.return_value} "
                             "DockerError(STATUS, 'MESSAGE')",), {}])
                else:
                    assert response
                    assert not m_logger.error.called


@pytest.mark.parametrize("inspect_raises", [True, False])
@pytest.mark.parametrize("build_raises", [True, False])
@pytest.mark.asyncio
async def test_docker_images_build(
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


@pytest.mark.parametrize("exists", [True, False])
@pytest.mark.parametrize("raises", [True, False])
@pytest.mark.asyncio
async def test_docker_images_exists(patch_playground, exists, raises):
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)

    _patch_tag = patch_playground(
        'connectors.docker.images.PlaygroundDockerImages._image_tag')
    _patch_logger = patch_playground(
        'connectors.docker.images.logger')
    if raises:
        _images.docker.images.list = AsyncMock(
            side_effect=aiodocker.DockerError(
                'STATUS', dict(message='MESSAGE')))
    elif exists:
        m_result = MagicMock()
        m_result.__getitem__.return_value.__contains__.return_value = True
        _images.docker.images.list = AsyncMock(
            return_value=[m_result])
    else:
        m_result = MagicMock()
        m_result.__getitem__.return_value.__contains__.return_value = False
        _images.docker.images.list = AsyncMock(
            return_value=[m_result])

    with _patch_tag as m_tag:
        with _patch_logger as m_logger:
            if exists and not raises:
                assert await _images.exists('IMAGE') is True
            else:
                assert await _images.exists('IMAGE') is False
            assert (
                list(m_tag.call_args)
                == [('IMAGE',), {}])
            assert (
                list(m_logger.debug.call_args)
                == [(f"Checking for image ({m_tag.return_value})",),
                    {}])
            assert (
                list(_images.docker.images.list.call_args)
                == [(), {}])
            if raises:
                assert (
                    list(m_logger.error.call_args)
                    == [(f"Failed checking for image ({m_tag.return_value}): "
                         "DockerError(STATUS, 'MESSAGE')",), {}])
            else:
                assert not m_logger.error.called


@pytest.mark.parametrize("raises", [True, False])
@pytest.mark.asyncio
async def test_docker_images_dunder_build(patch_playground, raises):
    connector = DummyPlaygroundClient()
    _images = images.PlaygroundDockerImages(connector)

    _patch_tar = patch_playground(
        'connectors.docker.images.mktar_from_docker_context')
    if raises:
        _images.docker.images.build = AsyncMock(
            side_effect=aiodocker.DockerError(
                'STATUS', dict(message='MESSAGE')))
    else:
        _images.docker.images.build = AsyncMock()
    with _patch_tar as m_tar:
        errored = False
        try:
            await _images._build('BUILD_FROM', 'IMAGE_TAG')
        except aiodocker.DockerError:
            errored = True
        if raises:
            assert errored
        else:
            assert not errored
        assert (
            list(m_tar.call_args)
            == [('context',), {}])
        assert (
            list(_images.docker.images.build.call_args)
            == [(),
                {'fileobj': m_tar.return_value,
                 'encoding': 'gzip',
                 'buildargs': {'BUILD_FROM': 'BUILD_FROM'},
                 'tag': 'IMAGE_TAG'}])
        assert (
            list(m_tar.return_value.close.call_args)
            == [(), {}])
