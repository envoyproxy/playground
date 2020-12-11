
from unittest.mock import AsyncMock, MagicMock, PropertyMock

import rapidjson as json  # type: ignore

import pytest

from playground.control import api, event, request
from playground.control.attribs import ValidatingAttribs
from playground.control.constants import (
    MIN_NAME_LENGTH, MAX_NAME_LENGTH,
    MIN_CONFIG_LENGTH, MAX_CONFIG_LENGTH,
    MAX_NETWORK_CONNECTIONS)


API_SIMPLE_METHODS = (
    ('network_add', 'networks.create'),
    ('network_delete', 'networks.delete'),
    ('network_edit', 'networks.edit'),
    ('proxy_add', 'proxies.create'),
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


class DummyEvent(event.PlaygroundEvent):

    def __init__(self):
        pass


def test_api(patch_playground):
    _patch_docker = patch_playground('api.endpoint.PlaygroundDockerClient')
    _patch_handler = patch_playground('api.endpoint.PlaygroundEventHandler')

    with _patch_docker as m_docker:
        with _patch_handler as m_handler:
            _api = api.PlaygroundAPI()
            assert _api.connector == m_docker.return_value
            assert (
                list(m_docker.call_args)
                == [(_api, ), {}])
            assert _api.handler == m_handler.return_value
            assert (
                list(m_handler.call_args)
                == [(_api,), {}])


def test_api_metadata():
    _api = DummyPlaygroundAPI()
    assert _api.metadata == dict(
        repository='https://github.com/envoyproxy/playground',
        title='Envoy playground',
        version='v0.2.3-alpha',
        max_network_connections=MAX_NETWORK_CONNECTIONS,
        min_name_length=MIN_NAME_LENGTH,
        max_name_length=MAX_NAME_LENGTH,
        min_config_length=MIN_CONFIG_LENGTH,
        max_config_length=MAX_CONFIG_LENGTH)


@pytest.mark.asyncio
async def test_api_clear():
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.clear = AsyncMock()
    _request = DummyRequest()

    await _api.clear.__wrapped__(_api, _request)
    assert (
        list(_api.connector.clear.call_args)
        == [(), {}])


@pytest.mark.asyncio
async def test_api_dump_resources():
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.dump_resources = AsyncMock(return_value=MagicMock())
    type(_api).services = PropertyMock()
    _request = DummyRequest()
    response = await _api.dump_resources.__wrapped__(_api, _request)
    _dumped = _api.connector.dump_resources.return_value
    assert response == _dumped
    assert (
        list(_api.connector.dump_resources.call_args)
        == [(), {}])
    assert (
        list(_dumped.update.call_args)
        == [({'meta': _api.metadata,
              'service_types': _api.services.types}, ), {}])


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
    _patch_attr = patch_playground('api.endpoint.attr')
    _request = DummyRequest()

    with _patch_attr as m_attr:
        await getattr(_api, method).__wrapped__(_api, _request)
        assert (
            list(_request._validate.call_args)
            == [(_api,), {}])
        assert (
            list(m_attr.asdict.call_args)
            == [(_request._validate.return_value,), {}])
        assert (
            list(_target.call_args)
            == [(m_attr.asdict.return_value,), {}])


@pytest.mark.asyncio
async def test_api_service_add(patch_playground):
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _api.connector.services.create = AsyncMock()
    _target = _api.connector.services.create
    type(_api).services = PropertyMock()
    _patch_attr = patch_playground('api.endpoint.attr')
    _request = DummyRequest()

    with _patch_attr as m_attr:
        await _api.service_add.__wrapped__(_api, _request)
        assert (
            list(_request._validate.call_args)
            == [(_api,), {}])
        assert (
            list(m_attr.asdict.call_args)
            == [(_request._validate.return_value,), {}])
        assert (
            list(_api.services.types.__getitem__.call_args)
            == [(m_attr.asdict.return_value.__getitem__.return_value, ),
                {}])
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


@pytest.mark.parametrize("resource", ['network', 'service', 'proxy'])
@pytest.mark.asyncio
async def test_api_publish_methods(patch_playground, resource):
    _api = DummyPlaygroundAPI()
    event = DummyEvent()
    event._data = ValidatingAttribs('asdf')

    _patch_publish = patch_playground(
        'api.endpoint.PlaygroundAPI._publish',
        new_callable=AsyncMock)

    with _patch_publish as m_publish:
        target = getattr(_api, f'publish_{resource}')
        await target.__wrapped__(_api, event)
        assert (
            list(m_publish.call_args)
            == [(resource, event._data), {}])


@pytest.mark.asyncio
async def test_api_dunder_publish(patch_playground):
    _api = DummyPlaygroundAPI()
    data = ValidatingAttribs('asdf')

    _patch_publish = patch_playground(
        'api.endpoint.PlaygroundAPI.publish',
        new_callable=AsyncMock)
    _patch_attr = patch_playground(
        'api.endpoint.attr')

    with _patch_publish as m_publish:
        with _patch_attr as m_attr:
            await _api._publish('TYPE', data)
            assert (
                list(m_publish.call_args)
                == [(m_attr.asdict.return_value, ), {}])
            assert (
                list(m_attr.asdict.call_args)
                == [(data, ), {}])


@pytest.mark.asyncio
async def test_api_publish(patch_playground):
    _api = DummyPlaygroundAPI()
    event = dict(THIS='did', HAPPEN='honest')
    _api._sockets = [AsyncMock(), AsyncMock(), AsyncMock()]
    await _api.publish(event)

    for socket in _api._sockets:
        assert (
            list(socket.send_json.call_args)
            == [({'THIS': 'did', 'HAPPEN': 'honest'},),
                {'dumps': json.dumps}])
