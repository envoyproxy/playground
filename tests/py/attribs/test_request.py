
from unittest.mock import AsyncMock, MagicMock

import pytest

from playground.control import api
from playground.control.attribs.network import NetworkEditAttribsMixin
from playground.control.exceptions import PlaygroundError


class DummyPlaygroundAPI(api.PlaygroundAPI):

    def __init__(self):
        pass


@pytest.mark.asyncio
async def test_attribs_network_mixin(patch_playground):
    mixin = NetworkEditAttribsMixin()
    assert mixin._id == ''

    _patch_network = patch_playground(
        'attribs.network.NetworkEditAttribsMixin._validate_network')
    _patch_resources = patch_playground(
        'attribs.network.NetworkEditAttribsMixin._validate_resources')
    _api = DummyPlaygroundAPI()

    with _patch_network as m_network:
        with _patch_resources as m_resources:
            await mixin.validate(_api)

    assert (
        list(list(c) for c in m_resources.call_args_list)
        == [[(_api, 'services'), {}],
            [(_api, 'proxies'), {}]])
    assert (
        list(list(c) for c in m_network.call_args_list)
        == [[(_api,), {}]])


@pytest.mark.asyncio
async def test_attribs_network_mixin_network(patch_playground):
    mixin = NetworkEditAttribsMixin()
    mixin._id = 'FOO'

    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()
    _networks = []
    for _net in ['BAR', 'BAZ']:
        _mock = MagicMock()
        _mock.get.return_value = _net
        _networks.append(_mock)
    _api.connector.networks.list = AsyncMock(
        return_value=_networks)

    _patch_getattr = patch_playground('attribs.network.getattr')

    with _patch_getattr as m_getattr:
        m_getattr.return_value = 'BAR'
        await mixin._validate_network(_api)
        assert (
            list(_networks[0].get.call_args)
            == [('FOO',), {}])
        assert (
            list(_networks[1].get.call_args)
            == [('FOO',), {}])
        assert (
            list(m_getattr.call_args)
            == [(mixin, 'FOO', None), {}])

    with _patch_getattr as m_getattr:
        m_getattr.return_value = 'MISSING'
        with pytest.raises(PlaygroundError):
            await mixin._validate_network(_api)
        assert (
            list(_networks[0].get.call_args)
            == [('FOO',), {}])
        assert (
            list(_networks[1].get.call_args)
            == [('FOO',), {}])
        assert (
            list(m_getattr.call_args)
            == [(mixin, 'FOO', None), {}])


@pytest.mark.asyncio
async def test_attribs_network_mixin_resources(patch_playground):
    mixin = NetworkEditAttribsMixin()
    mixin._id = 'FOO'
    _api = DummyPlaygroundAPI()
    _api.connector = MagicMock()

    _patch_getattr = patch_playground('attribs.network.getattr')
    _patch_all = patch_playground(
        'attribs.network.NetworkEditAttribsMixin._all_present')

    with _patch_getattr as m_getattr:
        with _patch_all as m_all:
            m_getattr.return_value = None
            await mixin._validate_resources(_api, 'FOO')
            assert (
                list(list(c) for c in m_getattr.call_args_list)
                == [[(mixin, 'FOO', None), {}]])
            assert not m_all.called

    with _patch_getattr as m_getattr:
        with _patch_all as m_all:

            def _getattr(obj, k, default=None):
                if obj == mixin:
                    return ['BAR', 'BAZ']
                _resource = MagicMock()
                _resource.list = AsyncMock(
                    return_value=[dict(FOO='A'), dict(BAR='B')])
                return _resource

            m_getattr.side_effect = _getattr
            await mixin._validate_resources(_api, 'FOO')

            assert (
                list(list(c) for c in m_getattr.call_args_list)
                == [[(mixin, 'FOO', None), {}],
                    [(_api.connector, 'FOO'), {}]])
            assert (
                list(list(c) for c in m_all.call_args_list)
                == [[('FOO', {'BAR', 'BAZ'}, {None, 'A'}), {}]])


MIXIN_SETS = (
    ({'FOO', 'BAR'}, True),
    ({'FOO'}, True),
    ({'BAR'}, True),
    ({'BAR', 'BAZ'}, True),
    ({'FOO', 'BAZ'}, True),

    ({'FOO', 'BAZe'}, False),
    ({'FOO', ''}, False),
    ({'FOO', 'BAZ', 'bar'}, False))


@pytest.mark.parametrize("subset,match", MIXIN_SETS)
def test_attribs_network_mixin_present(subset, match):
    mixin = NetworkEditAttribsMixin()
    superset = {'FOO', 'BAR', 'BAZ'}
    if match:
        mixin._all_present('TESTRES', subset, superset)
    else:
        with pytest.raises(PlaygroundError):
            mixin._all_present('TESTRES', subset, superset)
