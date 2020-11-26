#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Python playground control
"""

from setuptools import setup


install_requires = []

extras_require = {}
extras_require['test'] = [
    "pytest",
    "pytest-mock",
    "pytest-flake8",
    "pytest-coverage",
    "codecov"]

# TODO: Fix classifiers
setup(
    name='playground.control',
    version='0.0.1',
    description='playground.control',
    long_description="playground.control",
    url='https://github.com/envoyproxy/playground',
    author='Ryan Northey',
    author_email='ryan@synca.io',
    license='Apache 2',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Build Tools',
        ('License :: OSI Approved :: '
         'GNU General Public License v3 or later (GPLv3+)'),
        'Programming Language :: Python :: 3.5',
    ],
    keywords='playground control',
    install_requires=install_requires,
    extras_require=extras_require,
    packages=['playground.control'],
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'playground = playground.control.run:main']})
