# -*- coding: utf-8 -*-

from collections import OrderedDict

import attr

from playground.control.attribs.base import AttribsWithName
from playground.control.attribs.validators import all_members


# todo check length/validity of keys/values
def _validate_env_vars(item: list):
    if not item[0].strip():
        return
    return True


@attr.s
class ServiceAddAttribs(AttribsWithName):

    # v: exists
    # v: length and length of values
    # v: valid chars
    service_type = attr.ib(type=str)

    # v: length
    configuration = attr.ib(default='')

    # v: length
    # v: valid keys (length, chars)
    # v: valid values (length)
    # todo: im sure there must be a way to validate an
    #        attrib as an attrib class.
    env = attr.ib(
        type=OrderedDict,
        default=OrderedDict(),
        validator=[
            all_members(_validate_env_vars)])

    async def validate(self, api):
        pass


@attr.s
class ServiceCreateCommandAttribs(AttribsWithName):

    # v: exists
    # v: length and length of values
    # v: valid chars
    service_type = attr.ib()

    # v: length
    configuration = attr.ib(default='')

    config_path = attr.ib(default='')
    image = attr.ib(default='')

    # v: length
    # v: valid keys (length, chars)
    # v: valid values (length)
    # todo: im sure there must be a way to validate an
    #        attrib as an attrib class.
    env = attr.ib(
        type=OrderedDict,
        default=OrderedDict(),
        validator=[
            all_members(_validate_env_vars)])

    async def validate(self, api):
        pass
