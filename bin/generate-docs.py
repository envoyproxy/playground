#!/usr/bin/env python

import sys

import yaml


class ServiceDocsCreator(object):

    def __init__(self, docpath, services_yaml):
        self.docpath = docpath
        self.services_yaml = services_yaml
        print(f'Generating docs from {docpath} with {services_yaml}')

    @property
    def service_types(self) -> dict:
        with open(self.services_yaml) as f:
            parsed = yaml.safe_load(f.read())
        return parsed["services"]

    def create_service_files(self):
        for service in self.service_types:
            rst = f'{self.docpath}/services/{service}.rst'
            print(f'creating rst file: {rst}')
            underline = "=" * len(service)
            service_txt = f'{service}\n{underline}\n'
            with open(rst, 'w') as f:
                f.write(service_txt)

    def create_toc(self):
        rst = f'{self.docpath}/services/index.rst'
        with open(rst) as f:
            toc = f.read()
        toc = f"{toc}\n\n.. toctree::\n    :maxdepth: 3\n\n"
        for service in self.service_types:
            toc = f"{toc}    {service}\n"
        with open(rst, 'w') as f:
            f.write(toc)

    def create(self):
        self.create_service_files()
        self.create_toc()


def main():
    docpath = sys.argv[1]
    services_yaml = sys.argv[2]
    ServiceDocsCreator(docpath, services_yaml).create()


if __name__ == '__main__':
    main()
