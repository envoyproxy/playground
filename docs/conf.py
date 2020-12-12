# -*- coding: utf-8 -*-

from datetime import datetime
import os
from sphinx.directives.code import CodeBlock
import sphinx_rtd_theme
import sys


# https://stackoverflow.com/questions/44761197/how-to-use-substitution-definitions-with-code-blocks
class SubstitutionCodeBlock(CodeBlock):
  """
  Similar to CodeBlock but replaces placeholders with variables. See "substitutions" below.
  """

  def run(self):
    """
    Replace placeholders with given variables.
    """
    app = self.state.document.settings.env.app
    new_content = []
    existing_content = self.content
    for item in existing_content:
      for pair in app.config.substitutions:
        original, replacement = pair
        item = item.replace(original, replacement)
      new_content.append(item)

    self.content = new_content
    return list(CodeBlock.run(self))


def setup(app):
  app.add_config_value('release_level', '', 'env')
  app.add_config_value('substitutions', [], 'html')
  app.add_directive('substitution-code-block', SubstitutionCodeBlock)


with open('../VERSION') as f:
    substitutions = [('|playground_version|', f.read().strip())]

extensions = [
    'm2r2',
    'sphinxcontrib.httpdomain', 'sphinx.ext.extlinks', 'sphinx.ext.ifconfig', 'sphinx_tabs.tabs',
    'sphinx_copybutton', 'sphinxext.rediraffe']
copybutton_prompt_text = r"\$ |PS>"
copybutton_prompt_is_regexp = True
source_suffix = {
    '.rst': 'restructuredtext'}
master_doc = 'index'
project = u'Envoy playground'
copyright = u'2020-{}, Envoy playground project authors'.format(datetime.now().year)
author = u'Envoy playground project authors'
exclude_patterns = [
    '_include',
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
html_js_files = ['js/envoy.js']
htmlhelp_basename = 'envoydoc'
rediraffe_redirects = "redirects.txt"
