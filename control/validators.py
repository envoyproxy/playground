
import re
from collections import OrderedDict

import attr

from exceptions import ValidationError


# this will give total 20, 10 per proxies/services
MAX_NETWORK_CONNECTIONS = 10


# Request validators
# ------------------
#
# These are purely schematic validators, eg they dont check for the existence or uniqueness of names
#
# Although the ui will do some pre-validation in the forms, there still needs to be some tests
# for validation beyond what is done here.
#


@attr.s
class AddNetworkValidator(object):
    match_regex = re.compile(r"[A-Za-z0-9\-\._]+")

    name = attr.ib()
    proxies = attr.ib(default=[])
    services = attr.ib(default=[])

    @name.validator
    def check_name(self, attribute, value):
        if len(value) > 32:
            raise ValidationError(
                'name',
                'Name should be no more than 32 chars')
        matched = self.match_regex.fullmatch(value)
        if not matched:
            raise ValidationError(
                'name',
                'Name should only contain a-Z, 0-9, `_`, `-`, and `.`')
        invalid_double_patterns = ['.', '_', '-']
        for char in invalid_double_patterns:
            if char * 2 in value:
                raise ValidationError(
                    'name',
                    'Name should not have `_`, `-`, or `.` repeated in sequence.')

    @proxies.validator
    def check_proxies(self, attribute, value):
        if len(value) > MAX_NETWORK_CONNECTIONS:
            raise ValidationError(
                'proxies',
                f'No more than {MAX_NETWORK_CONNECTIONS} connections from a network to a proxy')
        if any(type(item) != str for item in value):
            raise ValidationError(
                'proxies',
                f'Invalid proxy network configuration')

    @services.validator
    def check_services(self, attribute, value):
        if len(value) > MAX_NETWORK_CONNECTIONS:
            raise ValidationError(
                'services',
                f'No more than {MAX_NETWORK_CONNECTIONS} connections from a network to a proxy')
        if any(type(item) != str  for item in value):
            raise ValidationError(
                'services',
                f'Invalid service network configuration')


@attr.s
class EditNetworkValidator(object):

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
class AddProxyValidator(object):

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
class AddServiceValidator(object):


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
class DeleteServiceValidator(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteNetworkValidator(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteProxyValidator(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()
