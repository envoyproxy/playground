#!/usr/bin/env python

import os
import shutil
import sys

import yaml

from jinja2 import Environment, FileSystemLoader, select_autoescape


jinja_env = Environment(
    loader=FileSystemLoader('docs/_templates'),
)


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

    def copy_service_images(self):
        os.mkdir(f'{self.docpath}/services/_include')
        for service in self.service_types:
            icon = self.service_types[service]['labels'].get('envoy.playground.logo')
            if icon:
                icon_src = f'services/{service}/{icon}'
                icon_dst = f'{self.docpath}/services/_include/{icon}'
                shutil.copyfile(icon_src, icon_dst)

    def create_service_files(self):
        template = jinja_env.get_template('service.rst.template')

        for service in self.service_types:
            rst = f'{self.docpath}/services/{service}.rst'
            print(f'creating rst file: {rst}')
            with open(rst, 'w') as f:
                f.write(template.render(
                    title=self.service_types[service]['labels'][
                        'envoy.playground.service']))

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
        self.copy_service_images()
        self.create_service_files()
        self.create_toc()


def main():
    docpath = sys.argv[1]
    services_yaml = sys.argv[2]
    ServiceDocsCreator(docpath, services_yaml).create()


if __name__ == '__main__':
    main()
