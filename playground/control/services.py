# -*- coding: utf-8 -*-

import os

import yaml


# TODO: implement git repo discovery
class PlaygroundServiceDiscovery(object):

    def __init__(self, services):
        self.service_discovery = services
        self._services = None

    @property
    def types(self) -> dict:
        if self._services is None:
            self._services = {}
            for _services_dir in self.service_discovery:
                with open(os.path.join(_services_dir, 'services.yaml')) as f:
                    parsed = yaml.safe_load(f.read())
            self._services.update(parsed["services"])
        return self._services
