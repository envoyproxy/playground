
import asyncio

import pytest

import playground.control.api


@pytest.mark.asyncio
async def test_some_asyncio_code():
    await asyncio.sleep(1)
    assert playground.control.api is not None
