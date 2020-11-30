
from unittest.mock import AsyncMock, MagicMock, PropertyMock

import rapidjson as json

import pytest

from playground.control import api, request
from playground.control.constants import (
    MIN_NAME_LENGTH, MAX_NAME_LENGTH,
    MIN_CONFIG_LENGTH, MAX_CONFIG_LENGTH,
    MAX_NETWORK_CONNECTIONS)


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        pass


class DummyPlaygroundRequest(request.PlaygroundRequest):

    def __init__(self):
        pass


def test_api(patch_playground):
    _patch_docker = patch_playground('api.listener.PlaygroundDockerClient')
    _patch_handler = patch_playground('api.listener.PlaygroundEventHandler')

    with _patch_docker as m_docker:
        with _patch_handler as m_handler:
            _api = api.PlaygroundAPI()
            assert _api.connector == m_docker.return_value
            assert (
                list(m_docker.call_args)
                == [(), {}])
            assert _api.handler == m_handler.return_value
            assert (
                list(m_handler.call_args)
                == [(_api,), {}])


def test_api_metadata():
    _api = DummyPlaygroundAPI()
    assert _api._envoy_image == "envoyproxy/envoy-dev:latest"
    assert _api.metadata == dict(
        version=_api._envoy_image,
        max_network_connections=MAX_NETWORK_CONNECTIONS,
        min_name_length=MIN_NAME_LENGTH,
        max_name_length=MAX_NAME_LENGTH,
        min_config_length=MIN_CONFIG_LENGTH,
        max_config_length=MAX_CONFIG_LENGTH)


@pytest.mark.asyncio
async def test_api_clear(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.clear = AsyncMock()
    _patch_resp = patch_playground('api.listener.web.json_response')
    _patch_request = patch_playground('api.listener.PlaygroundRequest')
    _request = DummyPlaygroundRequest()

    with _patch_resp as m_resp:
        with _patch_request as m_request:
            response = await _api.clear(_request)
            assert response == m_resp.return_value
            assert (
                list(m_resp.call_args)
                == [({'message': 'OK'},),
                    {'dumps': json.dumps}])
            assert (
                list(_api.connector.clear.call_args)
                == [(), {}])
            assert not m_request.called


@pytest.mark.asyncio
async def test_api_dump_resources(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.dump_resources = AsyncMock(return_value=MagicMock())
    type(_api).service_types = PropertyMock()
    _patch_resp = patch_playground('api.listener.web.json_response')
    _patch_request = patch_playground('api.listener.PlaygroundRequest')
    _request = DummyPlaygroundRequest()

    with _patch_resp as m_resp:
        with _patch_request as m_request:
            response = await _api.dump_resources(_request)
            assert response == m_resp.return_value
            assert (
                list(_api.connector.dump_resources.call_args)
                == [(), {}])
            assert (
                list(_api.connector.dump_resources.return_value.update.call_args)
                == [({'meta': _api.metadata,
                      'service_types': _api.service_types}, ), {}])
            assert (
                list(m_resp.call_args)
                == [(_api.connector.dump_resources.return_value,),
                    {'dumps': json.dumps}])
            assert not m_request.called
