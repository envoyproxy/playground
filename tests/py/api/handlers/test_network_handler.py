
from unittest.mock import AsyncMock

import pytest

import attr

from playground.control import api, event


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        self._publisher = AsyncMock()

    async def publish_network(self, event):
        await self._publisher(event)


class DummyEvent(event.PlaygroundEvent):

    def __init__(self):
        pass


@attr.s(kw_only=True)
class DummyData(object):
    action = attr.ib(type=str, default='')
    id = attr.ib(type=str, default='')
    name = attr.ib(type=str, default='')
    containers = attr.ib(type=list, default=[])
    proxy = attr.ib(type=str, default='')
    service = attr.ib(type=str, default='')


@pytest.mark.asyncio
async def test_api_network_handler_handle(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(action='ACTION')
    _patch_getattr = patch_playground(
        'api.handler.network.getattr')

    with _patch_getattr as m_getattr:
        m_getattr.return_value = AsyncMock()
        await handler.handle.__wrapped__(handler, event)
        assert (
            list(m_getattr.call_args)
            == [(handler, 'ACTION'), {}])
        assert (
            list(m_getattr.return_value.call_args)
            == [(event, ), {}])


@pytest.mark.parametrize('action', ['connect', 'create', 'disconnect'])
@pytest.mark.asyncio
async def test_api_network_handler_connections(patch_playground, action):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(id='X' * 20)
    _patch_connect = patch_playground(
        'api.handler.network.PlaygroundNetworkEventHandler._connection',
        new_callable=AsyncMock)

    with _patch_connect as m_connect:
        target = getattr(handler, action)
        await target(event)
        assert (
            list(m_connect.call_args)
            == [(event, ), {}])


@pytest.mark.asyncio
async def test_api_network_handler_destroy(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(id='X' * 20)
    _patch_publish = patch_playground(
        'api.handler.network.PlaygroundNetworkEventHandler._publish',
        new_callable=AsyncMock)

    with _patch_publish as m_publish:
        await handler.destroy(event)
        assert (
            list(m_publish.call_args)
            == [(event, {'id': 'XXXXXXXXXX'}), {}])


@pytest.mark.asyncio
async def test_api_network_handler_dunder_publish(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(id='X' * 20, action='ACTION', name='NAME')
    await handler._publish(event, dict(FOO='BAR', BAZ='OTHER', name='NONAME'))
    assert (
        list(_dummy_api._publisher.call_args)
        == [({'id': 'XXXXXXXXXX',
              'action': 'ACTION',
              'name': 'NONAME',
              'FOO': 'BAR',
              'BAZ': 'OTHER'},), {}])


@pytest.mark.asyncio
async def test_api_network_connection(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(id='X' * 20, action='ACTION', name='NAME')
    _patch_publish = patch_playground(
        'api.handler.network.PlaygroundNetworkEventHandler._publish',
        new_callable=AsyncMock)

    with _patch_publish as m_publish:
        await handler._connection(event)
        assert (
            list(m_publish.call_args)
            == [(event,
                 {'networks': {
                     'NAME': {
                         'name': 'NAME',
                         'id': 'XXXXXXXXXX',
                         'containers': []}}}), {}])


@pytest.mark.asyncio
async def test_api_network_connection_args(patch_playground):
    _dummy_api = DummyPlaygroundAPI()
    handler = api.handler.PlaygroundNetworkEventHandler(_dummy_api)
    event = DummyEvent()
    event._data = DummyData(
        id='X' * 20,
        action='ACTION',
        name='NAME',
        containers=['CONTAINER1', 'CONTAINER2'],
        proxy='PROXY1',
        service='SERVICE1')
    _patch_publish = patch_playground(
        'api.handler.network.PlaygroundNetworkEventHandler._publish',
        new_callable=AsyncMock)

    with _patch_publish as m_publish:
        await handler._connection(event)
        assert (
            list(m_publish.call_args)
            == [(event,
                 {'networks': {
                     'NAME': {
                         'name': 'NAME',
                         'id': 'XXXXXXXXXX',
                         'containers': ['CONTAINER1', 'CONTAINER2']}},
                  'proxy': 'PROXY1',
                  'service': 'SERVICE1'}), {}])
