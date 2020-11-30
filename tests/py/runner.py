
from playground.control import runner


def test_runner(patch_playground):
    endpoints = ()
    cors_allowed = "http://now.here:666"
    playground_env = "foo"
    _patch_api = patch_playground(
        'runner.PlaygroundAPI')
    _patch_app = patch_playground(
        'runner.web.Application')
    _patch_cors = patch_playground(
        'runner.aiohttp_cors.setup')
    _patch_endpoints = patch_playground(
        'runner.PlaygroundRunner.add_endpoints')
    _patch_static = patch_playground(
        'runner.PlaygroundRunner.add_static')
    with _patch_api as m_api:
        with _patch_app as m_app:
            with _patch_cors as m_cors:
                with _patch_endpoints as m_endpoints:
                    with _patch_static as m_static:
                        _runner = runner.PlaygroundRunner(
                            endpoints, cors_allowed, playground_env)
                        assert _runner.endpoints == endpoints
                        assert _runner.cors_allowed == cors_allowed
                        assert _runner.playground_env == playground_env
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
