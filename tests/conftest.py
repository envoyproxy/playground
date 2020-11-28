
from unittest.mock import patch

import pytest


def _patch(path):
    return patch(f'playground.control.{path}')


@pytest.fixture
def patch_playground():
    return _patch
