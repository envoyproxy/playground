
from unittest.mock import MagicMock

from playground.control import api


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        self.connector = MagicMock()


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
