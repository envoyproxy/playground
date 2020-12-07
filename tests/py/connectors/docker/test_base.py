
from unittest.mock import AsyncMock

import pytest

from playground.control.connectors.docker import base


class DummyDockerResources(base.PlaygroundDockerResources):

    def __init__(self):
        pass


@pytest.mark.asyncio
async def test_docker_base_clear(patch_playground):
    base = DummyDockerResources()
    _patch_list = patch_playground(
        'connectors.docker.base.PlaygroundDockerResources.list',
        new_callable=AsyncMock)
    _patch_delete = patch_playground(
        'connectors.docker.base.PlaygroundDockerResources.delete',
        new_callable=AsyncMock)
    with _patch_list as m_list:
        with _patch_delete as m_delete:
            m_list.return_value = [
                dict(id='FOO'),
                dict(id='BAR'),
                dict(id='BAZ')]
            await base.clear()
            assert (
                list(m_list.call_args)
                == [(), {}])
            assert (
                list(list(c) for c in m_delete.call_args_list)
                == [[({'id': 'FOO'},), {}],
                    [({'id': 'BAR'},), {}],
                    [({'id': 'BAZ'},), {}]])
