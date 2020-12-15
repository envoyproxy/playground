
import asyncio

import pytest


@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_service_create(playground):
    await playground.snap2('service.create.open')

    # open the proxy modal
    playground.web.find_elements_by_name('Services')[0].click()
    await asyncio.sleep(1)
    name_input = playground.web.find_elements_by_id(
        'envoy.playground.name')[0]
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter service name')

    # add first 2 keys of name
    name_input.send_keys('echo')
    await playground.snap2('service.create.name')

    # select a service type
    select = playground.web.find_element_by_css_selector(
        '.tab-pane.active form select#service_type')
    select.find_element_by_css_selector(
        '[value="http-echo"]').click()
    await playground.snap2('service.create.configuration', .3)

    # add an environment var
    playground.web.find_element_by_link_text('Environment').click()
    await asyncio.sleep(.3)

    key = playground.web.find_element_by_id('key')
    key.send_keys('MYVAR')
    value = playground.web.find_element_by_id('key')
    value.send_keys('somevalue')

    playground.web.find_element_by_css_selector(
        '.tab-pane.active form button').click()
    await playground.snap2('service.create.env', .3)

    # view ports
    playground.web.find_element_by_link_text('Ports').click()
    await asyncio.sleep(.3)
    await playground.snap2('service.create.ports', .3)

    # view readme
    playground.web.find_element_by_link_text('README').click()
    await asyncio.sleep(.3)
    await playground.snap2('service.create.readme', .3)

    # click to start
    playground.web.find_element_by_css_selector(
        '.modal-footer .btn.btn-primary').click()

    await playground.snap2('service.create.starting', .3)

    # wait for started
    await playground.snap2('service.create.started', 60)
