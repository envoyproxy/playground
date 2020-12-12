# -*- coding: utf-8 -*-

import attr

from playground.control.attribs.base import ValidatingAttribs


@attr.s(kw_only=True)
class ContainerEventAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    name = attr.ib(type=str)
    status = attr.ib(type=str)
    action = attr.ib(type=str)
    attributes = attr.ib(type=dict)
    logs = attr.ib(type=list, default=[])


@attr.s(kw_only=True)
class ProxyEventAttribs(ContainerEventAttribs):
    logs = attr.ib(type=list, default=[])
    port_mappings = attr.ib(type=list, default=[])
    image = attr.ib(type=str, default='')


@attr.s(kw_only=True)
class ServiceEventAttribs(ContainerEventAttribs):
    service_type = attr.ib(type=str, default='')


@attr.s(kw_only=True)
class ImageEventAttribs(ValidatingAttribs):
    action = attr.ib(type=str)
    image = attr.ib(type=str)


@attr.s(kw_only=True)
class NetworkEventAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    action = attr.ib(type=str)
    name = attr.ib(type=str)
    proxy = attr.ib(type=str, default='')
    service = attr.ib(type=str, default='')
    containers = attr.ib(type=list, default=[])


@attr.s(kw_only=True)
class NetworkTransmitAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    action = attr.ib(type=str)
    name = attr.ib(type=str)
    networks = attr.ib(type=dict, default={})
    service = attr.ib(type=str, default='')
    proxy = attr.ib(type=str, default='')


@attr.s(kw_only=True)
class ServiceTransmitAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    name = attr.ib(type=str)
    status = attr.ib(type=str)
    image = attr.ib(type=str, default='')
    service_type = attr.ib(type=str, default='')
    logs = attr.ib(type=list, default=[])


@attr.s(kw_only=True)
class ProxyTransmitAttribs(ValidatingAttribs):
    id = attr.ib(type=str)
    name = attr.ib(type=str)
    status = attr.ib(type=str)
    image = attr.ib(type=str, default='')
    logs = attr.ib(type=list, default=[])
    port_mappings = attr.ib(type=list, default=[])
