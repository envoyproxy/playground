#!/usr/bin/env python

import yaml


class ServiceDocsCreator(object):
    _services_yaml = 'services/services.yaml'

    @property
    def service_types(self) -> dict:
        with open(self._services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    def create_service_files(self):
        for service in self.service_types:
            print(f'creating service files: {service}')

    def generate_toc(self):
        pass

    def insert_toc(self):
        pass

    def create(self):
        self.create_service_files()


def main():
    ServiceDocsCreator().create()


if __name__ == '__main__':
    main()
