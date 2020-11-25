
from collections import OrderedDict


class Validator(object):

    def __init__(self, data):
        self._data = data


class AddNetworkValidator(Validator):

    @property
    def proxies(self):
        return self._data.get('proxies', [])

    @property
    def services(self):
        return self._data.get('services', [])

    @property
    def name(self):
        return self._data['name']


class EditNetworkValidator(Validator):

    @property
    def proxies(self):
        return self._data.get('proxies', [])

    @property
    def services(self):
        return self._data.get('services', [])

    @property
    def id(self):
        return self._data['id']


class AddProxyValidator(Validator):

    @property
    def port_mappings(self):
        return self._data.get('port_mappings', [])

    @property
    def configuration(self):
        return self._data['configuration']

    @property
    def name(self):
        return self._data['name']

    @property
    def certs(self):
        return self._data.get('certs', {})

    @property
    def binaries(self):
        return self._data.get('binaries', {})

    @property
    def logging(self):
        return self._data.get('logging', {})


class EditProxyValidator(Validator):

    @property
    def port_mappings(self):
        return self._data.get('port_mappings', [])

    @property
    def configuration(self):
        return self._data['configuration']

    @property
    def name(self):
        return self._data['name']

    @property
    def certs(self):
        return self._data.get('certs', {})

    @property
    def binaries(self):
        return self._data.get('binaries', {})

    @property
    def logging(self):
        return self._data.get('logging', {})


class AddServiceValidator(Validator):

    @property
    def configuration(self):
        return self._data['configuration']

    @property
    def name(self):
        return self._data['name']

    @property
    def service_type(self):
        return self._data['service_type']

    @property
    def env(self):
        return self._data.get('vars', OrderedDict())


class EditServiceValidator(Validator):

    @property
    def configuration(self):
        return self._data['configuration']

    @property
    def name(self):
        return self._data['name']


class DeleteServiceValidator(Validator):

    @property
    def name(self):
        return self._data['name']


class DeleteNetworkValidator(Validator):

    @property
    def name(self):
        return self._data['name']


class DeleteProxyValidator(Validator):

    @property
    def name(self):
        return self._data['name']
