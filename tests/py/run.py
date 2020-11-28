
from unittest.mock import patch

from playground.control import run


def test_run_runner():
    with patch('playground.control.run.PlaygroundRunner') as m_runner:
        run.main()
        assert (
            list(m_runner.call_args)
            == [(run.ENDPOINTS, run.CORS_ALLOWED), {}])
        assert m_runner.return_value.run.called


def test_run_main(script_runner):
    with patch('playground.control.run.main') as m_main:
        script_runner.run("playground")
        assert m_main.called
