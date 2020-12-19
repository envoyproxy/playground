
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_simple_front_proxy(playground):
    await playground.proxy_create('proxy0')
    await asyncio.sleep(10)
    await playground.move('proxy:proxy0', 61, 200)
    await playground.network_create('net0')
    await asyncio.sleep(10)
    await playground.move('network:net0', 300, 200)
    await playground.connect('net0', 'proxy:proxy0')
    await asyncio.sleep(1)
    await playground.service_create('http-echo', f"echo")
    await asyncio.sleep(10)
    await playground.move('service:echo', 500, 200)
    await playground.connect('net0', f'service:echo')
    await asyncio.sleep(5)
    await playground.snap('journey.front_proxy.all')
    await playground.switch_to('console')
    await asyncio.sleep(3)
    await playground.exec_async('term.paste("curl http://localhost:10000/http | jq \'.\'\\n")')
    await asyncio.sleep(2)
    await playground.snap('journey.front_proxy.console')
