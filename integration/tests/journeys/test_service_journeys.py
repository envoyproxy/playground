
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_service_create(playground):
    await playground.snap('service.create.open')

    # open the service modal
    add_service_button = await playground.query('*[name="Services"]')
    await add_service_button.click()
    await asyncio.sleep(1)

    # find the name input
    name_input = await playground.query('input[id="envoy.playground.name"]')
    assert (
        await name_input.command('GET', '/attribute/placeholder')
        == 'Enter service name')

    # enter service name
    await playground.enter(name_input, 'echo0')
    await asyncio.sleep(1)
    await playground.snap('service.create.name')

    # select a service type
    select = await playground.query(
        '.tab-pane.active form select#service_type [value="http-echo"]')
    await select.click()
    await asyncio.sleep(.3)
    await playground.snap('service.create.configuration')

    # add an environment var
    env_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Environment"]')
    await env_tab.click()
    await asyncio.sleep(.3)
    key = await playground.query('#key')
    await playground.enter(key, 'MYVAR')
    value = await playground.query('#key')
    await playground.enter(value, 'somevalue')
    add_button = await playground.query(
        '.tab-pane.active form button')
    await add_button.click()
    await playground.snap('service.create.env', .3)

    # view ports
    ports_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="Ports"]')
    await ports_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('service.create.ports', .3)

    # view readme
    readme_tab = await playground.query(
        '.modal-body .nav-tabs .nav-item a[text="README"]')
    await readme_tab.click()
    await asyncio.sleep(.3)
    await playground.snap('service.create.readme', .3)

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary')
    await submit.click()
    await asyncio.sleep(1)
    await playground.snap('service.create.starting', .3)

    # wait for started
    await playground.snap('service.create.started', 60)
    assert [
        container
        for container
        in await playground.docker.containers.list()
        if container['Labels'].get('envoy.playground.service') == 'echo0']
