#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Python playground control
"""

from setuptools import setup


with open('VERSION') as f:
    version = f.read().strip()


install_requires = [
    "aiodocker",
    "aiohttp",
    "aiohttp_cors",
    "attrs",
    "pytest-asyncio",
    "python-rapidjson",
    "pyyaml"]

extras_require = {}
extras_require['test'] = [
    "flake8",
    "mypy",
    "pytest",
    "pytest-console-scripts",
    "pytest-cov",
    "pytest-mock"]
extras_require['docs'] = [
    "jinja2",
    "m2r2",
    "pyyaml",
    "sphinx",
    "sphinx-copybutton",
    "sphinx-rtd-theme",
    "sphinx-tabs",
    "sphinxext-rediraffe",
    "sphinxcontrib-httpdomain",
    ]


# TODO: Fix classifiers
setup(
    name='playground.control',
    version=version,
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
