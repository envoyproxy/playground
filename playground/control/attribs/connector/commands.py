

import attr

from attr.validators import instance_of

from playground.control.attribs.validators import (
    has_length, all_members)
from playground.control.attribs.base import (
    AttribsWithName)
from playground.control.constants import (
    MAX_NETWORK_CONNECTIONS)


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
