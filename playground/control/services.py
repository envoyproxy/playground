# -*- coding: utf-8 -*-

import os
from functools import cached_property

import yaml


# TODO: implement git repo discovery
class PlaygroundServiceDiscovery(object):

    def __init__(self, services):
        self.service_discovery = services

    @cached_property
    def types(self) -> dict:
        _services = {}
        for _services_dir in self.service_discovery:
            with open(os.path.join(_services_dir, 'services.yaml')) as f:
                parsed = yaml.safe_load(f.read())
                _services.update(parsed["services"])
        return _services
