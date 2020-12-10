
from unittest.mock import MagicMock

from playground.control import api, event


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        self.connector = MagicMock()


class DummyEvent(event.PlaygroundEvent):

    def __init__(self):
        pass


def test_api_handler(patch_playground):
    _dummy_api = DummyPlaygroundAPI()

    _patch_proxy = patch_playground(
        'api.handler.PlaygroundProxyEventHandler')
    _patch_service = patch_playground(
        'api.handler.PlaygroundServiceEventHandler')
    _patch_network = patch_playground(
        'api.handler.PlaygroundNetworkEventHandler')

    with _patch_proxy as m_proxy:
        with _patch_service as m_service:
            with _patch_network as m_network:
                _handler = api.PlaygroundEventHandler(_dummy_api)
                assert _handler.api == _dummy_api
                assert _handler.connector == _dummy_api.connector
                assert (
                    list(m_proxy.call_args)
                    == [(_handler, ), {}])
                assert (
                    list(m_network.call_args)
                    == [(_handler, ), {}])
                assert (
                    list(m_service.call_args)
                    == [(_handler, ), {}])
                assert _handler.handler == dict(
                    errors=_handler.handle_errors,
                    image=_handler.handle_image,
                    service=_handler.service.handle,
                    proxy=_handler.proxy.handle,
                    network=_handler.network.handle)
                assert _handler.debug == []
