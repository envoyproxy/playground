# -*- coding: utf-8 -*-

import re

import attr

from attr.validators import instance_of, matches_re

from playground.control.attribs.validators import has_length
from playground.control.constants import (
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
    RE_NAME,
    RE_NOT_NAME)


class ValidatingAttribs(object):

    def __init__(self, value):
        pass

    # api: p.c.api.PlaygroundAPI
    async def validate(self, api):
        pass


@attr.s(kw_only=True)
class AttribsWithName(ValidatingAttribs):
    name = attr.ib(
        type=str,
        validator=[
            instance_of(str),
            has_length(f'>={MIN_NAME_LENGTH}'),
            has_length(f'<={MAX_NAME_LENGTH}'),
            matches_re(RE_NAME),
            matches_re(RE_NOT_NAME, func=re.match), ])


@attr.s
class ContainerDeleteAttribs(AttribsWithName):
    pass
