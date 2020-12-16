
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_proxy_create(playground):
    await playground.snap('proxy.create.open')

    # open the proxy modal
    add_proxy_button = await playground.query('*[name="Proxies"]')
    assert not await add_proxy_button.click()
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
    assert not await select.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.configuration')

    # add a port
    ports_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Ports")')
    assert (
        await ports_tab.text()
        == 'Ports')
    assert not await ports_tab.click()
    await asyncio.sleep(.3)
    port_button = await playground.query('.tab-pane.active form button')
    assert not await port_button.click()
    await playground.snap('proxy.create.ports', .3)

    # set logging
    log_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Logging")')
    assert (
        await log_tab.text()
        == 'Logging')
    assert not await log_tab.click()
    await asyncio.sleep(.3)
    select = await playground.query(
        '.tab-pane.active form select [value="trace"]')
    assert not await select.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.logging')

    # open certs tab
    certs_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Certificates")')
    assert (
        await certs_tab.text()
        == 'Certificates')
    assert not await certs_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.certificates')

    # open binaries tab
    binary_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Binaries")')
    assert (
        await binary_tab.text()
        == 'Binaries')
    assert not await binary_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('proxy.create.binaries')

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary')
    assert not await submit.click()
    await asyncio.sleep(.1)
    await playground.snap('proxy.create.starting', .3)
    await asyncio.sleep(1)

    # wait for started
    await asyncio.sleep(60)
    await playground.move('proxy:proxy0', 230, 230)

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
