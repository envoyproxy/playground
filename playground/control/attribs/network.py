# -*- coding: utf-8 -*-

import attr

from attr.validators import instance_of, matches_re

from playground.control.attribs.validators import (
    has_length, all_members)
from playground.control.attribs.base import (
    AttribsWithName, ValidatingAttribs)
from playground.control.constants import (
    MAX_NETWORK_CONNECTIONS,
    RE_UUID)
from playground.control.exceptions import PlaygroundError


def id_attrib_factory():
    return attr.ib(
        type=str,
        validator=[
            has_length(10),
            matches_re(RE_UUID)])


def resource_attrib_factory():
    return attr.ib(
        type=list,
        default=[],
        validator=[
            instance_of(list),
            has_length(f'<{MAX_NETWORK_CONNECTIONS}'),
            all_members(lambda m: type(m) == str)])


class NetworkEditAttribsMixin(object):

    # api: p.c.api.PlaygroundAPI
    async def validate(self, api) -> None:
        await self._validate_network(api)
        await self._validate_resources(api, 'services')
        await self._validate_resources(api, 'proxies')

    # api: p.c.api.PlaygroundAPI
    async def _validate_network(self, api) -> None:
        networks = await api.connector.networks.list()

        if getattr(self, 'id', None):
            if self.id not in [n['id'] for n in networks]:
                raise PlaygroundError(
                    f'Unrecognized network id {self.id}.', self)
        else:
            for network in networks:
                if network['name'] == self.name:
                    raise PlaygroundError(
                        f'A network with the name {self.name} already exists.',
                        self)

    # api: p.c.api.PlaygroundAPI
    async def _validate_resources(self, api, resource: str) -> None:
        resource = getattr(self, resource, None)
        if not resource:
            return
        # check all of the requested services are present
        # in the list
        resources = getattr(api.connector, resource)
        resources = set(
            s['name']
            for s
            in await resources.list())
        _resources = set(self.resources)
        if (resources ^ _resources) & _resources:
            raise PlaygroundError(
                f'Connection to unrecognized {resource} requested.',
                self)


@attr.s(kw_only=True)
class NetworkAddAttribs(AttribsWithName, NetworkEditAttribsMixin):
    proxies = resource_attrib_factory()
    services = resource_attrib_factory()


@attr.s
class NetworkEditAttribs(ValidatingAttribs, NetworkEditAttribsMixin):
    id = id_attrib_factory()
    proxies = resource_attrib_factory()
    services = resource_attrib_factory()


@attr.s
class NetworkDeleteAttribs(ValidatingAttribs):
    id = id_attrib_factory()
