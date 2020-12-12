
import os
import pytest
import time


class Playground(object):
    _artifact_dir = '/artifacts'

    def __init__(self, selenium):
        self.web = selenium

    def snap(self, name, wait=0):
        time.sleep(wait)

        self.web.get_screenshot_as_file(
            os.path.join(
                self._artifact_dir,
                name))


@pytest.fixture
def playground(selenium):
    _playground = Playground(selenium)
    _playground.web.get("http://localhost:8000")
    time.sleep(.3)
    return _playground
