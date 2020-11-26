
import re
from collections import OrderedDict

import attr
from attr.validators import instance_of, matches_re

from exceptions import ValidationError
from validators import has_length, has_members


# this will give total 20, 10 per proxies/services
MAX_NETWORK_CONNECTIONS = 10

MAX_NAME_LENGTH = 3


# Request validators
# ------------------
#
# These are purely schematic validators, eg they dont check for the existence or uniqueness of names
#
# Although the ui will do some pre-validation in the forms, there still needs to be some tests
# for validation beyond what is done here.
#


@attr.s(kw_only=True)
class AddNetworkAttribs(object):

    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'<{MAX_NAME_LENGTH}'),
            matches_re(r"[A-Za-z0-9\-\._]+")])
    proxies = attr.ib(
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            has_members(lambda m: type(m) == str)])
    services = attr.ib(
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            has_members(lambda m: type(m) == str)])


@attr.s
class EditNetworkAttribs(object):

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
class AddProxyAttribs(object):

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
class AddServiceAttribs(object):


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
class DeleteServiceAttribs(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteNetworkAttribs(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()


@attr.s
class DeleteProxyAttribs(object):

    # v: exists
    # v: length
    # v: valid chars a-Z_-.
    # v: no double ^^
    name = attr.ib()
