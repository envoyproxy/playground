
from unittest.mock import patch

import pytest


def _patch(path, *args, **kwargs):
    return patch(
        f'playground.control.{path}',
        *args,
        **kwargs)


@pytest.fixture
def patch_playground():
    return _patch
