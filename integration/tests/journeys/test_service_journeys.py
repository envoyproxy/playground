
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_service_create(playground):
    await playground.snap('service.create.open', .5)

    # open the service modal
    add_service_button = await playground.query('*[name="Services"]', 1)
    assert not await add_service_button.click()

    # find the name input
    name_input = await playground.query('input[id="envoy.playground.name"]', 1)
    assert (
        await name_input.command('GET', '/attribute/placeholder')
        == 'Enter service name')

    # enter service name
    await playground.enter(name_input, 'echo0')
    await playground.snap('service.create.name', .7)

    # select a service type
    select = await playground.query(
        '.tab-pane.active form select#service_type [value="http-echo"]')
    assert not await select.click()

    await playground.snap('service.create.configuration', .3)

    # add an environment var
    env_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Environment")', 1)
    assert (
        await env_tab.text()
        == 'Environment')
    assert not await env_tab.click()
    key = await playground.query('#key', 1)
    assert (
        await key.command('GET', '/attribute/placeholder')
        == 'Variable name')
    await playground.enter(key, 'MYVAR')
    value = await playground.query('#value')
    assert (
        await value.command('GET', '/attribute/placeholder')
        == 'Variable value')

    await playground.enter(value, 'somevalue')

    add_button = await playground.query(
        '.tab-pane.active form button.btn-success')
    assert (
        await add_button.text()
        == '+')
    assert not await add_button.click()

    await playground.snap('service.create.env', .3)

    key = await playground.query(
        '.modal-body .tab-pane.active .col-sm-5  div:contains("MYVAR")')
    text = await key.text()
    assert (
        await key.text()
        == 'MYVAR')
    value = await playground.query(
        '.modal-body .tab-pane.active .col-sm-6 div:contains("somevalue")')
    assert (
        await value.text()
        == 'somevalue')

    # view ports
    ports_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("Ports")')
    assert (
        await ports_tab.text()
        == 'Ports')
    assert not await ports_tab.click()
    await playground.snap('service.create.ports', .3)

    # view readme
    readme_tab = await playground.query(
        '.modal-body .nav-tabs a:contains("README")')
    assert (
        await readme_tab.text()
        == 'README')
    assert not await readme_tab.click()
    await playground.snap('service.create.readme', .3)

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary', 1)
    assert not await submit.click()
    await playground.snap('service.create.starting', .1)

    link = await playground.query(
        '.App-right .accordion-item .card-header .col-sm-8', 60)
    await playground.move('service:echo0', 230, 230)
    assert (
        await link.text()
        == 'echo0')

    # wait for started
    await asyncio.sleep(10)
    await playground.snap('service.create.started')
    assert [
        container
        for container
        in await playground.docker.containers.list()
        if container['Labels'].get('envoy.playground.service') == 'echo0']
