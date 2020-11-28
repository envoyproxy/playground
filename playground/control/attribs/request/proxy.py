
from collections import OrderedDict

import attr
from attr.validators import instance_of

from playground.control.attribs.validators import (
    has_length, is_well_formed)
from playground.control.attribs import AttribsWithName
from playground.control.constants import (
    MIN_CONFIG_LENGTH,
    MAX_CONFIG_LENGTH)


@attr.s
class ProxyAddAttribs(AttribsWithName):
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
class ProxyDeleteAttribs(AttribsWithName):
    pass
