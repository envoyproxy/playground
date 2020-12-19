
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_simple_front_proxy(playground):
    # create the proxy
    await playground.proxy_create('proxy0')
    await asyncio.sleep(5)
    await playground.move('proxy:proxy0', 61, 200)

    # create the network
    await playground.network_create('net0')
    await asyncio.sleep(5)
    await playground.move('network:net0', 300, 200)
    await playground.connect('net0', 'proxy:proxy0')
    await asyncio.sleep(1)

    # create the service
    await playground.service_create('http-echo', "http-echo0")
    await asyncio.sleep(5)
    await playground.move('service:http-echo0', 500, 200)
    await playground.connect('net0', 'service:http-echo0')
    await asyncio.sleep(1)
    await playground.snap('journey.front_proxy.all')

    # switch to console and curl
    await playground.switch_to('console')
    await asyncio.sleep(2)
    await playground.console_command(
        "curl -s http://localhost:10000/8080", 1)
    await playground.console_command(
        "curl -s http://localhost:10000/8080 | jq '.protocol'", 1)
    await playground.console_command(
        "curl -s http://localhost:10000/8080 | jq '.headers[\"X-Forwarded-Proto\"]'", 1)
    await playground.console_command(
        "curl -s http://localhost:10000/8443 | jq '.protocol'", 1)
    await playground.console_command(
        "curl -s http://localhost:10000/8080 | jq '.headers[\"X-Forwarded-Proto\"]'", 1)
    await playground.snap('journey.front_proxy.console.http')
