
from playground.control import runner

from utils import _patch


def test_runner():
    endpoints = ()
    cors_allowed = "http://now.here:666"
    _patch_api = _patch('runner.PlaygroundAPI')
    _patch_app = _patch('runner.web.Application')
    _patch_cors = _patch('runner.aiohttp_cors.setup')
    _patch_endpoints = _patch('runner.PlaygroundRunner.add_endpoints')
    _patch_static = _patch('runner.PlaygroundRunner.add_static')
    with _patch_api as m_api:
        with _patch_app as m_app:
            with _patch_cors as m_cors:
                with _patch_endpoints as m_endpoints:
                    with _patch_static as m_static:
                        _runner = runner.PlaygroundRunner(
                            endpoints, cors_allowed)
                        assert _runner.endpoints == endpoints
                        assert _runner.cors_allowed == cors_allowed
                        assert (
                            list(m_app.call_args)
                            == [(), {}])
                        assert (
                            list(m_api.call_args)
                            == [(), {}])
                        assert (
                            list(m_cors.call_args)
                            == [(m_app.return_value, ), {}])
                        assert (
                            list(m_static.call_args)
                            == [(), {}])
                        assert (
                            list(m_endpoints.call_args)
                            == [(), {}])
