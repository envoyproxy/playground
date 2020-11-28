
from unittest.mock import patch

from playground.control import run


def test_run_main():
    with patch('playground.control.run.PlaygroundRunner') as m_runner:
        run.main()
        assert (
            list(m_runner.call_args)
            == [(run.ENDPOINTS, run.CORS_ALLOWED), {}])
