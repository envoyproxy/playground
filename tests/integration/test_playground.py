
import time


def test_title(selenium):
    selenium.get("http://localhost:8000")
    assert "Envoy" in selenium.title
    time.sleep(1)
    selenium.get_screenshot_as_file('/tmp/tests/home.png')


def test_open_proxy_modal(selenium):
    selenium.get("http://localhost:8000")

    time.sleep(1)

    # open the proxy modal
    selenium.find_elements_by_name('Proxies')[0].click()
    name_input = selenium.find_elements_by_id('name')[0]
    assert (
        name_input.get_attribute('placeholder')
        == 'Enter proxy name')
    time.sleep(.1)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.open.png')

    # enter name of proxy
    name_input.send_keys('proxy0')
    time.sleep(.1)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.name.png')

    # select an example configuration
    name_input.send_keys('proxy0')
    time.sleep(.1)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.name.png')

    # click the ports dialog
    selenium.find_element_by_link_text('Ports').click()
    time.sleep(.1)

    selenium.find_element_by_css_selector('.tab-pane.active form button').click()

    time.sleep(.1)
    selenium.get_screenshot_as_file('/tmp/tests/proxy.create.ports.png')
