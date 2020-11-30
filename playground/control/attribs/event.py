# -*- coding: utf-8 -*-

import attr

from playground.control.attribs.base import ValidatingAttribs


@attr.s(kw_only=True)
class ContainerEventAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    status = attr.ib(type=str)
    action = attr.ib(type=str)
    attributes = attr.ib(type=dict)


@attr.s(kw_only=True)
class ImageEventAttribs(ValidatingAttribs):
    action = attr.ib(type=str)


@attr.s(kw_only=True)
class NetworkEventAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    action = attr.ib(type=str)
    name = attr.ib(type=str)
