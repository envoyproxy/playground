
import argparse
import asyncio
import base64
import functools
import os

import pytest

import pyquery

import aiodocker
import aiohttp

from aioselenium import Remote


class Playground(object):
    _artifact_dir = '/artifacts'

    def __init__(self, selenium, screenshots=False):
        self.web = selenium
        self.screenshots = screenshots

    @functools.cached_property
    def docker(self):
        return aiodocker.Docker()

    @functools.cached_property
    def pq(self):
        return pyquery.pyquery.JQueryTranslator()

    async def clear(self):
        containers = [
            container
            for container
            in await self.docker.containers.list()
            if ('envoy.playground.proxy' in container['Labels']
                or 'envoy.playground.service' in container['Labels'])]
        for container in containers:
            await container.delete(force=True, v=True)
        networks = [
            n['Id']
            for n in await self.docker.networks.list()
            if 'envoy.playground.network' in n['Labels']]
        for network in networks:
            await aiodocker.networks.DockerNetwork(
                self.docker, network).delete()

    async def connect(self, network, target):
        link = await self.query(
            '.App-left .accordion-item .card-header a:contains("edit")')
        assert not await link.click()
        if target.startswith('service'):
            service_tab = await self.query(
                '.modal-body .nav-tabs a:contains("Services")')
            assert not await service_tab.click()
            _target = target.split(':')[1]
            checkbox = await self.query(
                f'.tab-pane.active form input[name="{_target}"]')
            assert not await checkbox.click()
        else:
            proxy_tab = await self.query(
                '.modal-body .nav-tabs a:contains("Proxies")')
            assert not await proxy_tab.click()
            _target = target.split(':')[1]
            checkbox = await self.query(
                f'.tab-pane.active form input[name="{_target}"]')
            assert not await checkbox.click()
        close = await self.query(
            '.modal-footer .btn.btn-secondary:contains("Close")')
        assert not await close.click()

    async def network_create(self, name):
        add_network_button = await self.query('*[name="Networks"]')
        assert not await add_network_button.click()
        name_input = await self.query(
            'input[id="envoy.playground.name"]')
        assert not await self.enter(name_input, name)
        submit = await self.query('.modal-footer .btn.btn-primary')
        assert not await submit.click()

    async def proxy_create(self, name):
        add_proxy_button = await self.query('*[name="Proxies"]')
        assert not await add_proxy_button.click()
        name_input = await self.query(
            'input[id="envoy.playground.name"]')
        assert not await self.enter(name_input, name)
        select = await self.query(
            '.tab-pane.active form select'
            '#example option[value="Service: HTTP/S echo"]')
        assert not await select.click()
        submit = await self.query('.modal-footer .btn.btn-primary')
        assert not await submit.click()

    async def service_list(self):
        js_service_list = (
            "arguments[0]("
            "Object.keys(playground.store.getState().service_type.value))")
        return await self.web.command(
            'POST',
            '/execute_async',
            json=dict(
                args=[],
                script=js_service_list))

    async def service_create(self, service_type, name):
        add_service_button = await self.query('*[name="Services"]')
        assert not await add_service_button.click()
        name_input = await self.query(
            'input[id="envoy.playground.name"]')
        assert not await self.enter(name_input, name)
        select = await self.query(
            f'.tab-pane.active form select#service_type '
            f'[value="{service_type}"]')
        assert not await select.click()
        submit = await self.query('.modal-footer .btn.btn-primary')
        assert not await submit.click()

    async def enter(self, element, text):
        return await element.command(
            'POST',
            '/value',
            json=dict(value=list(text)))

    async def move(self, item, x, y):
        js_move_icon = (
            f"playground.cloud('{item}').then(n => n.move({x}, {y}))")
        assert not await self.web.command(
            'POST',
            '/execute',
            json=dict(
                args=[],
                script=js_move_icon))

    async def query(self, q, timeout=0):
        xpath = self.pq.css_to_xpath(q)
        el = await self.web.find_element_by_xpath(xpath)
        if el.element.endswith('unknown'):
            if timeout > 0:
                await asyncio.sleep(.1)
                return await self.query(q, timeout - .1)
            return
        return el

    async def query_all(self, q):
        xpath = self.pq.css_to_xpath(q)
        return await self.web.find_elements_by_xpath(xpath)

    async def snap(self, name, wait=0):
        if not self.screenshots:
            return
        await asyncio.sleep(wait)
        name = f'{name}.png'
        path = os.path.join(
            self._artifact_dir,
            name)
        with open(path, 'wb') as f:
            f.write(base64.b64decode(await self.web.screenshot()))


def pytest_addoption(parser):
    parser.addoption(
        "--screenshots",
        type=str2bool,
        nargs='?',
        const=True, default=False,
        help="Activate nice mode.")


def str2bool(v):
    if isinstance(v, bool):
        return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "screenshots: user journeys that create screenshots")


def pytest_runtest_setup(item):
    if item.config.getoption("--screenshots"):
        if 'screenshots' not in [x.name for x in item.iter_markers()]:
            pytest.skip("Only running screenshot tests")


@pytest.fixture
async def playground(pytestconfig):
    capabilities = {"browserName": "firefox"}

    async with aiohttp.ClientSession() as session:
        remote = await Remote.create(
            'http://localhost:4444',
            capabilities,
            session)
        async with remote as driver:
            await driver.set_window_size(1920, 1080)
            playground = Playground(
                driver,
                screenshots=pytestconfig.getoption('screenshots'))
            await playground.clear()
            await driver.get("http://localhost:8000")
            yield playground
            await playground.clear()
            await playground.docker.close()
