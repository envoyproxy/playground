
from collections import OrderedDict

import attr


# Request validators
# ------------------
#
# These are purely schematic validators, eg they dont check for the existence or uniqueness of names
#
# Although the ui will do some pre-validation in the forms, there still needs to be some tests
# for validation beyond what is done here.
#

class Validator(object):

    def __init__(self, **data):
        self._data = data


@attr.s
class AddNetworkValidator(Validator):

    # v: valid chars for name
    # v: length
    name = attr.ib()
    # v: length
    # v: proxy dicts
    proxies = attr.ib(default=[])
    # v: length
    # v: service dicts
    services = attr.ib(default=[])


@attr.s
class EditNetworkValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars for uuid
    id = attr.ib()

    # v: length
    # v: proxy dicts
    proxies = attr.ib(default=[])

    # v: length
    # v: service dicts
    services = attr.ib(default=[])


@attr.s
class AddProxyValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()

    # v: exists
    # v: length
    # v: valid yaml
    # v: valid envoy config ?
    configuration = attr.ib()

    # v: length
    # v: port_mapping dicts
    # v: mapping to/from are in valid ranges
    port_mappings = attr.ib(default=[])

    # v: length
    # v: valid keys
    # v: length of values
    certs = attr.ib(default=OrderedDict())

    # v: length
    # v: valid keys
    # v: length of values
    binaries = attr.ib(default=OrderedDict())

    # v: option/s
    logging = attr.ib(default=OrderedDict())


@attr.s
class AddServiceValidator(Validator):


    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()

    # v: exists
    # v: length and length of values
    # v: valid chars
    service_type = attr.ib()

    # v: length
    configuration = attr.ib(default='')

    # v: length
    # v: valid keys (length, chars)
    # v: valid values (length)
    env = attr.ib(default=OrderedDict())


@attr.s
class DeleteServiceValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteNetworkValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteProxyValidator(Validator):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()
