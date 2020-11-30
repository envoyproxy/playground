
from unittest.mock import AsyncMock, MagicMock, PropertyMock

import rapidjson as json

import pytest

from playground.control import api, request
from playground.control.constants import (
    MIN_NAME_LENGTH, MAX_NAME_LENGTH,
    MIN_CONFIG_LENGTH, MAX_CONFIG_LENGTH,
    MAX_NETWORK_CONNECTIONS)


API_SIMPLE_METHODS = (
    ('network_add', 'networks.create'),
    ('network_delete', 'networks.delete'),
    ('network_edit', 'networks.edit'),
    ('proxy_delete', 'proxies.delete'),
    ('service_delete', 'services.delete'))


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        pass


class DummyRequest(request.PlaygroundRequest):

    def __init__(self):
        self._validate = MagicMock()

    async def validate(self, _api):
        self._valid_data = self._validate(_api)


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
    _request = DummyRequest()

    with _patch_resp as m_resp:
        response = await _api.clear.__wrapped__(_api, _request)
        assert response == m_resp.return_value
        assert (
            list(m_resp.call_args)
            == [({'message': 'OK'},),
                {'dumps': json.dumps}])
        assert (
            list(_api.connector.clear.call_args)
            == [(), {}])
        assert response == m_resp.return_value


@pytest.mark.asyncio
async def test_api_dump_resources(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.dump_resources = AsyncMock(return_value=MagicMock())
    type(_api).services = PropertyMock()
    _patch_resp = patch_playground('api.listener.web.json_response')
    _request = DummyRequest()

    with _patch_resp as m_resp:
        response = await _api.dump_resources.__wrapped__(_api, _request)
        assert response == m_resp.return_value
        _dumped = _api.connector.dump_resources.return_value
        assert (
            list(_api.connector.dump_resources.call_args)
            == [(), {}])
        assert (
            list(_dumped.update.call_args)
            == [({'meta': _api.metadata,
                  'service_types': _api.services.types}, ), {}])
        assert (
            list(m_resp.call_args)
            == [(_dumped,),
                {'dumps': json.dumps}])
        assert response == m_resp.return_value


@pytest.mark.parametrize("method,command", API_SIMPLE_METHODS)
@pytest.mark.asyncio
async def test_api_methods(patch_playground, method, command):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _resource = getattr(_api.connector, command.split('.')[0])
    setattr(
        _resource, command.split('.')[1],
        AsyncMock(return_value=MagicMock()))
    _target = getattr(_resource, command.split('.')[1])
    _patch_resp = patch_playground('api.listener.web.json_response')
    _patch_attr = patch_playground('api.listener.attr')
    _request = DummyRequest()

    with _patch_resp as m_resp:
        with _patch_attr as m_attr:
            response = await getattr(_api, method).__wrapped__(_api, _request)
            assert (
                list(_request._validate.call_args)
                == [(_api,), {}])
            assert (
                list(m_attr.asdict.call_args)
                == [(_request._validate.return_value,), {}])
            assert (
                list(_target.call_args)
                == [(m_attr.asdict.return_value,), {}])
            assert (
                list(m_resp.call_args)
                == [({'message': 'OK'},),
                    {'dumps': json.dumps}])
            assert response == m_resp.return_value


@pytest.mark.asyncio
async def test_api_proxy_add(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.proxies.create = AsyncMock()
    _target = _api.connector.proxies.create
    _patch_resp = patch_playground('api.listener.web.json_response')
    _patch_attr = patch_playground('api.listener.attr')
    _request = DummyRequest()

    with _patch_resp as m_resp:
        with _patch_attr as m_attr:
            response = await _api.proxy_add.__wrapped__(_api, _request)
            assert (
                list(_request._validate.call_args)
                == [(_api,), {}])
            assert (
                list(m_attr.asdict.call_args)
                == [(_request._validate.return_value,), {}])
            assert (
                list(m_attr.asdict.return_value.__setitem__.call_args)
                == [('image', _api._envoy_image), {}])
            assert (
                list(_target.call_args)
                == [(m_attr.asdict.return_value,), {}])
            assert (
                list(m_resp.call_args)
                == [({'message': 'OK'},),
                    {'dumps': json.dumps}])
            assert response == m_resp.return_value


@pytest.mark.asyncio
async def test_api_service_add(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.services.create = AsyncMock()
    _target = _api.connector.services.create
    type(_api).services = PropertyMock()
    _patch_resp = patch_playground('api.listener.web.json_response')
    _patch_attr = patch_playground('api.listener.attr')
    _request = DummyRequest()

    with _patch_resp as m_resp:
        with _patch_attr as m_attr:
            response = await _api.service_add.__wrapped__(_api, _request)
            assert (
                list(_request._validate.call_args)
                == [(_api,), {}])
            assert (
                list(m_attr.asdict.call_args)
                == [(_request._validate.return_value,), {}])
            assert (
                list(_api.services.types.__getitem__.call_args)
                == [(_request._validate.return_value.service_type,), {}])
            assert (
                list(m_attr.asdict.return_value.get.call_args)
                == [('configuration',), {}])

            _service_config = _api.services.types.__getitem__.return_value
            _service_types = _service_config.__getitem__

            assert (
                list(m_attr.asdict.return_value.__setitem__.call_args)
                == [('config_path',
                     _service_types.return_value.get.return_value), {}])

            # todo test adding without config
            assert (
                list(_service_types.call_args)
                == [('labels',), {}])
            assert (
                list(_service_types.return_value.get.call_args)
                == [('envoy.playground.config.path',), {}])
            assert (
                list(m_attr.asdict.return_value.__setitem__.call_args)
                == [('config_path',
                     _service_types.return_value.get.return_value), {}])
            assert (
                [list(c)
                 for c
                 in list(
                     m_attr.asdict.return_value.__setitem__.call_args_list)]
                == [[('image',
                     _service_config.get.return_value),
                     {}],
                    [('config_path',
                      _service_types.return_value.get.return_value),
                     {}]])

            assert (
                list(_target.call_args)
                == [(m_attr.asdict.return_value,), {}])
            assert (
                list(m_resp.call_args)
                == [({'message': 'OK'},),
                    {'dumps': json.dumps}])
            assert response == m_resp.return_value
