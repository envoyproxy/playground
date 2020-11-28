
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


@attr.s(kw_only=True)
class NetworkAddAttribs(AttribsWithName):
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

    # api: p.c.api.PlaygroundAPI
    async def validate(self, api):
        networks = await api.connector.list_networks()

        for network in networks:
            if network['name'] == self.name:
                raise PlaygroundError(
                    f'A network with the name {self.name} already exists.',
                    self)

        if self.services:
            # check all of the requested services are present
            # in the service list
            services = set(
                s['name']
                for s
                in await api.connector.list_services())
            _services = set(self.services)
            if (services ^ _services) & _services:
                raise PlaygroundError(
                    'Connection to unrecognized service requested.',
                    self)

        if self.proxies:
            # check all of the requested proxies are present in the proxy list
            proxies = set(
                s['name']
                for s
                in await api.connector.list_proxies())
            _proxies = set(self.proxies)
            if (proxies ^ _proxies) & _proxies:
                raise PlaygroundError(
                    'Connection to unrecognized proxy requested.',
                    self)


@attr.s
class NetworkEditAttribs(ValidatingAttribs):
    id = attr.ib(
        has_length(10),
        matches_re(RE_UUID))
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

    # api: p.c.api.PlaygroundAPI
    async def validate(self, api):
        networks = await api.connector.list_networks()

        if self.id not in [n['id'] for n in networks]:
            raise PlaygroundError(
                f'Unrecognized network id {self.id}.', self)

        if self.services:
            # check all of the requested services are present
            # in the service list
            services = set(
                s['name']
                for s
                in await api.connector.list_services())
            _services = set(self.services)
            if (services ^ _services) & _services:
                raise PlaygroundError(
                    'Connection to unrecognized service requested.',
                    self)

        if self.proxies:
            # check all of the requested proxies are present in the proxy list
            proxies = set(
                s['name']
                for s
                in await api.connector.list_proxies())
            _proxies = set(self.proxies)
            if (proxies ^ _proxies) & _proxies:
                raise PlaygroundError(
                    'Connection to unrecognized proxy requested.',
                    self)


@attr.s
class NetworkDeleteAttribs(AttribsWithName):
    pass
