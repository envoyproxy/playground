
import pytest


@pytest.mark.asyncio
async def test_title(playground):
    title = await playground.query('title', 2)
    assert (
        await title.text()
        == "Envoy playground")
