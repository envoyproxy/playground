
import time

import pytest

# import aiodocker


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_network_create(playground):
    await playground.snap2('network.create.open')

    # open the proxy modal
    playground.web.find_elements_by_name('Networks')[0].click()
    time.sleep(1)
    name_input = playground.web.find_elements_by_id(
        'envoy.playground.name')[0]
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter network name')

    # add network name
    name_input.send_keys('net0')
    await playground.snap2('network.create.name')

    # click to start
    playground.web.find_element_by_css_selector(
        '.modal-footer .btn.btn-primary').click()

    await playground.snap2('network.create.starting', .3)

    # wait for started
    await playground.snap2('network.create.started', 60)
