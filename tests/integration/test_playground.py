
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
    name_input.send_keys('pr')
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter proxy name')
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.name.png')

    # add configuration
    name_input.send_keys('oxy0')
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
    select = selenium.find_element_by_css_selector('.tab-pane.active form select')
    select.find_element_by_css_selector('[value="trace"]').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.logging.png')

    # open certs tab
    selenium.find_element_by_link_text('Certificates').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.certificates.png')

    # open binaries tab
    selenium.find_element_by_link_text('Binaries').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.binaries.png')

    # click to start
    selenium.find_element_by_css_selector('.modal-footer .btn.btn-primary').click()
    time.sleep(.3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.starting.png')

    # wait for started
    time.sleep(3)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.started.png')
