
from unittest.mock import patch

import pytest


def _patch(path):
    return patch(f'playground.control.{path}')


@pytest.fixture
def patch_playground():
    return _patch


def pytest_configure(config):
    plugin = config.pluginmanager.getplugin('mypy')
    plugin.mypy_argv.append('--follow-imports=skip')
