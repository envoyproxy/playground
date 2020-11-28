
from unittest.mock import patch


# todo: move this to a fixture
def _patch(path):
    return patch(f'playground.control.{path}')
