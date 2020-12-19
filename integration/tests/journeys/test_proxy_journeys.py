
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_proxy_create(playground):
    await playground.snap('proxy.create.open', .5)

    # open the proxy modal
    add_proxy_button = await playground.query('*[name="Proxies"]', 1)
    assert not await add_proxy_button.click()

    # find the name input
    name_input = await playground.query(
        'input[id="envoy.playground.name"]', 1)
    assert (
        await name_input.command('GET', '/attribute/placeholder')
        == 'Enter proxy name')

    # add first 2 keys of name
    await playground.enter(name_input, 'pr')
    await playground.snap('proxy.create.name', .7)

    # add rest of name and open configuration
    await playground.enter(name_input, 'oxy0')

    select = await playground.query(
        '.tab-pane.active form select'
        '#example option[value="Service: HTTP/S echo"]')
    assert not await select.click()
    await playground.snap('proxy.create.configuration', .3)

    # add a port
    ports_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Ports")', 1)
    assert (
        await ports_tab.text()
        == 'Ports')
    assert not await ports_tab.click()
    port_button = await playground.query('.tab-pane.active form button', 1)
    assert not await port_button.click()
    await playground.snap('proxy.create.ports', .3)

    # set logging
    log_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Logging")')
    assert (
        await log_tab.text()
        == 'Logging')
    assert not await log_tab.click()
    select = await playground.query(
        '.tab-pane.active form select [value="trace"]', 1)
    assert not await select.click()
    await playground.snap('proxy.create.logging', .3)

    # open certs tab
    certs_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Certificates")')
    assert (
        await certs_tab.text()
        == 'Certificates')
    assert not await certs_tab.click()
    await playground.snap('proxy.create.certificates', .3)

    # open binaries tab
    binary_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Binaries")')
    assert (
        await binary_tab.text()
        == 'Binaries')
    assert not await binary_tab.click()
    await playground.snap('proxy.create.binaries', .3)

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary')
    assert not await submit.click()
    await playground.snap('proxy.create.starting', .3)

    link = await playground.query(
        '.App-left .accordion-item .card-header .col-sm-8', 60)
    await playground.move('proxy:proxy0', 230, 230)
    assert (
        await link.text()
        == 'proxy0')
    # todo: we need to wait for the modal to close
    await asyncio.sleep(10)
    await playground.snap('proxy.create.started')
    assert [
        container
        for container
        in await playground.docker.containers.list()
        if container['Labels'].get('envoy.playground.proxy') == 'proxy0']
