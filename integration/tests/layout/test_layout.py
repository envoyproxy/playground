
import pytest


@pytest.mark.asyncio
async def test_title(playground):
    assert (
        await playground.web.get_title()
        == "Envoy playground")
