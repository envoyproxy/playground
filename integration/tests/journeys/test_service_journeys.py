
import time

import pytest


@pytest.mark.screenshots
def test_journey_service_create(playground):
    playground.snap('service.create.open')

    # open the proxy modal
    playground.web.find_elements_by_name('Services')[0].click()
    time.sleep(1)
    name_input = playground.web.find_elements_by_id('name')[0]
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter service name')

    # add first 2 keys of name
    name_input.send_keys('echo')
    playground.snap('service.create.name')

    # select a service type
    select = playground.web.find_element_by_css_selector(
        '.tab-pane.active form select#service_type')
    select.find_element_by_css_selector(
        '[value="HTTP/S echo"]').click()
    playground.snap('service.create.configuration', .3)

    # add an environment var
    playground.web.find_element_by_link_text('Environment').click()
    time.sleep(.3)

    key = playground.web.find_element_by_id('key')
    key.send_keys('MYVAR')
    value = playground.web.find_element_by_id('key')
    value.send_keys('somevalue')

    playground.web.find_element_by_css_selector(
        '.tab-pane.active form button').click()
    playground.snap('service.create.env', .3)

    # view ports
    playground.web.find_element_by_link_text('Ports').click()
    time.sleep(.3)
    playground.snap('service.create.ports', .3)

    # view readme
    playground.web.find_element_by_link_text('README').click()
    time.sleep(.3)
    playground.snap('service.create.readme', .3)

    # click to start
    playground.web.find_element_by_css_selector(
        '.modal-footer .btn.btn-primary').click()

    playground.snap('service.create.starting', .3)

    # wait for started
    playground.snap('service.create.started', 60)
