
import os


def test_title(selenium):
    selenium.get("http://localhost:8000")
    assert "Envoy" in selenium.title


def test_open_proxy_modal(selenium):
    selenium.get("http://localhost:8000")
    selenium.find_elements_by_name('Proxies')[0].click()
    assert (
        selenium.find_elements_by_id(
            'name')[0].get_attribute('placeholder')
        == 'Enter proxy name')
    selenium.get_screenshot_as_file('foo.png')
    assert os.path.exists('foo.png')
