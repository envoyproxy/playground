
import time

import pytest


@pytest.mark.screenshots
def test_journey_network_create(playground):
    playground.snap('network.create.open')

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
    playground.snap('network.create.name')

    # click to start
    playground.web.find_element_by_css_selector(
        '.modal-footer .btn.btn-primary').click()

    playground.snap('network.create.starting', .3)

    # wait for started
    playground.snap('network.create.started', 60)
