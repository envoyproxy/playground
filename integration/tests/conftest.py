
import argparse
import os
import pytest
import time


class Playground(object):
    _artifact_dir = '/artifacts'

    def __init__(self, selenium, screenshots=False):
        self.web = selenium
        self.screenshots = screenshots

    def snap(self, name, wait=0):
        if not self.screenshots:
            return
        time.sleep(wait)
        name = f'{name}.png'
        self.web.get_screenshot_as_file(
            os.path.join(
                self._artifact_dir,
                name))


def pytest_addoption(parser):
    parser.addoption(
        "--screenshots",
        type=str2bool,
        nargs='?',
        const=True, default=False,
        help="Activate nice mode.")


def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


def pytest_configure(config):
    # register an additional marker
    config.addinivalue_line(
        "markers", "screenshots: user journeys that create screenshots")


def pytest_runtest_setup(item):
    if item.config.getoption("--screenshots"):
        if 'screenshots' not in [x.name for x in item.iter_markers()]:
            pytest.skip("Only running screenshot tests")


@pytest.fixture
def playground(pytestconfig, selenium):
    _playground = Playground(
        selenium,
        screenshots=pytestconfig.getoption('screenshots'))
    _playground.web.get("http://localhost:8000")
    time.sleep(.3)
    return _playground
