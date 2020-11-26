
import re
from collections import OrderedDict

import attr
from attr.validators import instance_of, matches_re, is_well_formed

from .exceptions import PlaygroundError, ValidationError
from .validators import has_length, all_members


# this will give total 20, 10 per proxies/services
MAX_NETWORK_CONNECTIONS = 10

MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 32
MIN_CONFIG_LENGTH = 7
MAX_CONFIG_LENGTH = 4096

RE_NAME = r'[a-z]+[a-z0-9\.\-_]*$'
RE_NOT_NAME = r'(?!.*(__|\.\.|\-\-)+.*$)'
RE_UUID = r'[0-9a-f]+$'


@attr.s(kw_only=True)
class AddNetworkAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])
    proxies = attr.ib(
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])
    services = attr.ib(
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])

    async def validate(self, api):
        networks = await api.client.list_networks()
        for network in networks:
            if network['name'] == self.name:
                raise PlaygroundError(f'A network with the name {self.name} already exists.', self)

@attr.s
class EditNetworkAttribs(object):

    id = attr.ib(
        has_length(10),
        matches_re(RE_UUID))

    # v: length
    # v: proxy dicts
    proxies = attr.ib(default=[])

    # v: length
    # v: service dicts
    services = attr.ib(default=[])

    async def validate(self, api):
        pass


@attr.s
class AddProxyAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])

    configuration = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_CONFIG_LENGTH}'),
            has_length(f'<={MAX_CONFIG_LENGTH}'),
            is_well_formed('yaml')])

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

    async def validate(self, api):
        pass

@attr.s
class AddServiceAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])

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

    async def validate(self, api):
        pass

@attr.s
class DeleteServiceAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])

    async def validate(self, api):
        pass


@attr.s
class DeleteNetworkAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])

    async def validate(self, api):
        pass


@attr.s
class DeleteProxyAttribs(object):
    name = attr.ib(
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match),])

    async def validate(self, api):
        pass
