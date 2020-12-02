# -*- coding: utf-8 -*-

from datetime import datetime
import os
from sphinx.directives.code import CodeBlock
import sphinx_rtd_theme
import sys


def setup(app):
    pass


extensions = [
    'recommonmark',
    'sphinxcontrib.httpdomain', 'sphinx.ext.extlinks', 'sphinx.ext.ifconfig', 'sphinx_tabs.tabs',
    'sphinx_copybutton', 'sphinxext.rediraffe']
copybutton_prompt_text = r"\$ |PS>"
copybutton_prompt_is_regexp = True
source_suffix = {
    '.rst': 'restructuredtext',
    '.md': 'markdown'}
master_doc = 'index'
project = u'Envoy playground'
copyright = u'2020-{}, Envoy playground project authors'.format(datetime.now().year)
author = u'Envoy playground project authors'
exclude_patterns = [
    '_build',
    '_venv',
    'Thumbs.db',
    '.DS_Store']
html_theme = 'sphinx_rtd_theme'
html_theme_options = {
    'logo_only': True,
    'includehidden': False}
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
html_logo = '_static/img/envoy.svg'
html_favicon = 'favicon.ico'
html_static_path = ['_static']
html_style = 'css/envoy.css'
htmlhelp_basename = 'envoydoc'
rediraffe_redirects = "redirects.txt"
