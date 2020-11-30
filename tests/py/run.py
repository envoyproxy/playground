
from playground.control import run


def test_run_runner(patch_playground):
    with patch_playground('run.PlaygroundRunner') as m_runner:
        run.main()
        assert (
            list(m_runner.call_args)
            == [(run.ENDPOINTS,
                 run.CORS_ALLOWED,
                 run.PLAYGROUND_ENV), {}])
        assert m_runner.return_value.run.called


def test_run_main(script_runner, patch_playground):
    with patch_playground('run.main') as m_main:
        script_runner.run("playground")
        assert m_main.called
