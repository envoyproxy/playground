
import argparse
import asyncio
import base64
import functools
import os

import pytest

import pyquery

import aiodocker
import aiohttp

from aioselenium import Keys, Remote


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
        add_proxy_button = await self.query('*[name="Proxies"]', 5)
        assert not await add_proxy_button.click()
        name_input = await self.query(
            'input[id="envoy.playground.name"]', 5)
        assert not await self.enter(name_input, name)
        select = await self.query(
            '.tab-pane.active form select'
            '#example option[value="Service: HTTP/S echo"]', 5)
        assert not await select.click()

        # add ports
        ports_tab = await self.query(
            '.modal-body .nav-tabs a:contains("Ports")', 1)
        assert not await ports_tab.click()

        # adds default port
        port_button = await self.query('.tab-pane.active form button', 1)
        assert not await port_button.click()

        # adds 10001 -> 10001
        mapping_from = await self.query('#mapping_from', 1)
        await self.enter(mapping_from, Keys.UP_ARROW)
        mapping_to = await self.query('#mapping_to', 1)
        await self.enter(mapping_to, Keys.UP_ARROW)
        port_button = await self.query('.tab-pane.active form button', 1)
        assert not await port_button.click()
        await self.snap('journey.front_proxy.ports')

        # submit the form
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

    async def open(self, url):
        await self.web.command(
            'POST',
            '/execute',
            json=dict(
                args=[],
                script=f"window.open('{url}', '_blank');"))

    async def exec_async(self, command):
        js_command = (
            "arguments[0]("
            f"{command})")
        return await self.web.command(
            'POST',
            '/execute_async',
            json=dict(
                args=[],
                script=js_command))

    async def console_command(self, command, wait_after=0):
        command = command.replace("\\", "\\\\").replace('"', '\\"')
        result = await self.exec_async(
            f'term.paste("{command}\\n")')
        await asyncio.sleep(wait_after)
        return result

    async def open_windows(self):
        await self.web.get('http://localhost:3000/wetty')
        await self.open("http://localhost:8000")
        await self.exec_async('term.setOption("fontSize", 22)')
        response = await self.console_command(
            'export PS1="\e[0;36mplayground-host \$ \e[m"')
        await self.console_command('clear')
        handles = await self.web.command('GET', endpoint='/window_handles')
        handle = await self.web.command('GET', endpoint='/window_handle')
        self._handles = dict(playground=handles[1], console=handles[0])
        await self.switch_to('playground')

    async def switch_to(self, tab):
        assert not await self.web.command(
            'POST',
            '/window',
            json=dict(
                handle=self._handles[tab]))

    async def query(self, q, timeout=0):
        xpath = self.pq.css_to_xpath(q)
        el = await self.web.find_element_by_xpath(xpath)
        if el.element.endswith('unknown'):
            if timeout > 0:
                await asyncio.sleep(.1)
                return await self.query(q, timeout - .1)
            return
        return el

    async def query_all(self, q, timeout=0):
        xpath = self.pq.css_to_xpath(q)
        els = [
            el
            for el
            in await self.web.find_elements_by_xpath(xpath)
            if not el.element.endswith('unknown')]
        if not els:
            if timeout > 0:
                await asyncio.sleep(.1)
                return await self.query_all(q, timeout - .1)
            return
        return els

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
            await playground.open_windows()
            yield playground
            await playground.clear()
            await playground.docker.close()
