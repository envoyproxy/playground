
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_proxy_create(playground):
    await playground.snap('proxy.create.open')

    # open the proxy modal
    add_proxy_button = await playground.query('*[name="Proxies"]')
    await add_proxy_button.click()
    await asyncio.sleep(1)

    # find the name input
    name_input = await playground.query(
        'input[id="envoy.playground.name"]')
    assert (
        await name_input.command('GET', '/attribute/placeholder')
        == 'Enter proxy name')

    # add first 2 keys of name
    await playground.enter(name_input, 'pr')
    await asyncio.sleep(1)
    await playground.snap('proxy.create.name')

    # add rest of name and open configuration
    await playground.enter(name_input, 'oxy0')

    select = await playground.query(
        '.tab-pane.active form select'
        '#example option[value="Service: HTTP/S echo"]')

    await select.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.configuration')

    # add a port
    env_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Ports"]')
    await env_tab.click()
    await asyncio.sleep(.3)
    port_button = await playground.query('.tab-pane.active form button')
    await port_button.click()
    await playground.snap('proxy.create.ports', .3)

    # set logging
    log_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Logging"]')
    await log_tab.click()
    await asyncio.sleep(.3)
    select = await playground.query(
        '.tab-pane.active form select [value="trace"]')
    await select.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.logging')

    # open certs tab
    certs_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Certificates"]')
    await certs_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.certificates')

    # open binaries tab
    binary_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Binaries"]')
    await binary_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.binaries')

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary')
    await submit.click()
    await asyncio.sleep(1)
    await playground.snap('proxy.create.starting', .3)

    # wait for started
    await asyncio.sleep(60)

    link = await playground.query(
        '.App-left .accordion-item .card-header .col-sm-8')
    assert (
        await link.text()
        == 'proxy0')
    await playground.snap('proxy.create.started')
    assert [
        container
        for container
        in await playground.docker.containers.list()
        if container['Labels'].get('envoy.playground.proxy') == 'proxy0']
