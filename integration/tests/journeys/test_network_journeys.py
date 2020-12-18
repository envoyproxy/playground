
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_network_create(playground):
    await playground.snap('network.create.open', .3)

    # open the network modal
    add_network_button = await playground.query('*[name="Networks"]', 1)
    await add_network_button.click()

    # find the name input
    name_input = await playground.query('input[id="envoy.playground.name"]', 1)
    assert (
        await name_input.command('GET', '/attribute/placeholder')
        == 'Enter network name')

    # input the network name
    await playground.enter(name_input, 'net0')
    await playground.snap('network.create.name', .5)

    # submit the form
    submit = await playground.query('.modal-footer .btn.btn-primary')
    await submit.click()
    await playground.move('network:net0', 230, 230)
    await playground.snap('network.create.starting', .2)
    await playground.snap('network.create.started', 1)
    link = await playground.query(
        '.App-left .accordion-item .card-header .col-sm-8', 5)
    assert (
        await link.text()
        == 'net0')
    assert [
        n
        for n in await playground.docker.networks.list()
        if n['Labels'].get('envoy.playground.network') == 'net0']
