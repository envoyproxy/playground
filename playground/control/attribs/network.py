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
    _id = ''

    # api: p.c.api.PlaygroundAPI
    async def validate(self, api) -> None:
        await self._validate_network(api)
        await self._validate_resources(api, 'services')
        await self._validate_resources(api, 'proxies')

    # api: p.c.api.PlaygroundAPI
    async def _validate_network(self, api) -> None:
        networks = [
            n.get(self._id)
            for n
            in await api.connector.networks.list()
            if n]

        _id = getattr(self, self._id, None)
        if _id not in networks:
            raise PlaygroundError(
                f'Unrecognized network {self._id}: {_id}.', self)

    # api: p.c.api.PlaygroundAPI
    async def _validate_resources(self, api, resource: str) -> None:
        resources = getattr(self, resource, None)
        if not resources:
            return
        self._all_present(
            resource,
            set(resources),
            set(s.get(self._id)
                for s
                in await getattr(api.connector, resource).list()))

    def _all_present(self, resource, subset, superset):
        if (superset ^ subset) & subset:
            raise PlaygroundError(
                f'Connection to unrecognized {resource} requested.',
                self)


@attr.s(kw_only=True)
class NetworkAddAttribs(AttribsWithName, NetworkEditAttribsMixin):
    _id = 'name'
    proxies = resource_attrib_factory()
    services = resource_attrib_factory()


@attr.s
class NetworkEditAttribs(ValidatingAttribs, NetworkEditAttribsMixin):
    _id = 'id'
    id = id_attrib_factory()
    proxies = resource_attrib_factory()
    services = resource_attrib_factory()


@attr.s
class NetworkDeleteAttribs(ValidatingAttribs):
    id = id_attrib_factory()
