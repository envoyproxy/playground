
import time


def test_title(selenium):
    selenium.get("http://localhost:8000")
    assert "Envoy" in selenium.title


def test_open_proxy_modal(selenium):
    selenium.get("http://localhost:8000")

    time.sleep(1)

    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.open.png')

    # open the proxy modal
    selenium.find_elements_by_name('Proxies')[0].click()
    time.sleep(1)
    name_input = selenium.find_elements_by_id('name')[0]
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter proxy name')
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.name.png')

    # add configuration
    name_input.send_keys('proxy0')
    select = selenium.find_element_by_css_selector('.tab-pane.active form select#example')
    select.find_element_by_css_selector('[value="Service: Python (asyncio)"]').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.configuration.png')

    # add a port
    selenium.find_element_by_link_text('Ports').click()
    time.sleep(.3)
    selenium.find_element_by_css_selector('.tab-pane.active form button').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.ports.png')

    # set logging
    selenium.find_element_by_link_text('Logging').click()
    time.sleep(.3)
    select = selenium.find_element_by_css_selector('.tab-pane.active form select#example')
    select.find_element_by_css_selector('[value="trace"]').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.logging.png')
