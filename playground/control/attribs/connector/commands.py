

import attr

from attr.validators import instance_of, matches_re

from playground.control.attribs.validators import (
    has_length, all_members)
from playground.control.attribs.base import (
    AttribsWithName, ValidatingAttribs)
from playground.control.constants import (
    MAX_NETWORK_CONNECTIONS, RE_UUID)


@attr.s(kw_only=True)
class NetworkCreateConnectorAttribs(AttribsWithName):
    proxies = attr.ib(
        type=list,
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])
    services = attr.ib(
        type=list,
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])


@attr.s(kw_only=True)
class NetworkDeleteConnectorAttribs(AttribsWithName):
    pass


@attr.s
class NetworkEditConnectorAttribs(ValidatingAttribs):
    id = attr.ib(
        has_length(10),
        matches_re(RE_UUID))
    proxies = attr.ib(
        type=list,
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])
    services = attr.ib(
        type=list,
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])
