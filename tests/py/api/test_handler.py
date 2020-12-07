
from unittest.mock import MagicMock

import pytest

from playground.control import api, event


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        self.connector = MagicMock()


class DummyEvent(event.PlaygroundEvent):

    def __init__(self):
        pass


def test_api_handler(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    _handler = api.PlaygroundEventHandler(_dummy_api)
    assert _handler.api == _dummy_api
    assert _handler.connector == _dummy_api.connector
    assert _handler.handler == dict(
        errors=_handler.handle_errors,
        image=_handler.handle_image,
        service=_handler.handle_service,
        proxy=_handler.handle_proxy,
        network=_handler.handle_network)
    assert _handler.debug == []


HANDLER_CONTAINER_METHODS = (
    'proxy',
    'service')


@pytest.mark.parametrize("arg", HANDLER_CONTAINER_METHODS)
@pytest.mark.asyncio
async def test_api_handler_proxy(patch_playground, arg):
    target = '_handle_container'
    method = f'handle_{arg}'

    _dummy_api = DummyPlaygroundAPI()
    _handler = api.PlaygroundEventHandler(_dummy_api)
    _handler_patch = patch_playground(
        f'api.handler.PlaygroundEventHandler.{target}')
    _event = DummyEvent()
    with _handler_patch as m_handler:
        await getattr(_handler, method).__wrapped__(_handler, _event)
        assert (
            list(m_handler.call_args)
            == [(arg, _event), {}])
