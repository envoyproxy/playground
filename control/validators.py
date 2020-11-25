
from collections import OrderedDict


# Request validators
# ------------------
#
# These are purely schematic validators, eg they dont check for the existence or uniqueness of names
#
# Although the ui will do some pre-validation in the forms, there still needs to be some tests
# for validation beyond what is done here.
#

class Validator(object):

    def __init__(self, data):
        self._data = data


class AddNetworkValidator(Validator):

    # v: length
    # v: proxy dicts
    @property
    def proxies(self):
        return self._data.get('proxies', [])

    # v: length
    # v: service dicts
    @property
    def services(self):
        return self._data.get('services', [])

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']


class EditNetworkValidator(Validator):

    # v: length
    # v: proxy dicts
    @property
    def proxies(self):
        return self._data.get('proxies', [])

    # v: length
    # v: service dicts
    @property
    def services(self):
        return self._data.get('services', [])

    # v: exists
    # v: length
    # v: valid chars for uuid
    @property
    def id(self):
        return self._data['id']


class AddProxyValidator(Validator):

    # v: length
    # v: port_mapping dicts
    # v: mapping to/from are in valid ranges
    @property
    def port_mappings(self):
        return self._data.get('port_mappings', [])

    # v: exists
    # v: length
    # v: valid yaml
    # v: valid envoy config ?
    @property
    def configuration(self):
        return self._data['configuration']

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']

    # v: length
    # v: valid keys
    # v: length of values
    @property
    def certs(self):
        return self._data.get('certs', {})

    # v: length
    # v: valid keys
    # v: length of values
    @property
    def binaries(self):
        return self._data.get('binaries', {})

    # v: option/s
    @property
    def logging(self):
        return self._data.get('logging', {})


class AddServiceValidator(Validator):

    # v: length
    @property
    def configuration(self):
        return self._data['configuration']

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']

    # v: exists
    # v: length
    # v: valid chars
    @property
    def service_type(self):
        return self._data['service_type']

    # v: length
    # v: valid keys (length, chars)
    # v: valid values (length)
    @property
    def env(self):
        return self._data.get('vars', OrderedDict())


class DeleteServiceValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']


class DeleteNetworkValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']


class DeleteProxyValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    @property
    def name(self):
        return self._data['name']
