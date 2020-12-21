
import asyncio
import functools

import pytest

import yaml


class IntegrationTest(object):

    def __init__(self, playground, config):
        self.playground = playground
        self._config = config

    @functools.cached_property
    def steps(self):
        with open(self._config) as f:
            content = f.read()
        return [
            list(s.items())[0]
            for s
            in yaml.safe_load(content)['steps']]

    async def run(self):
        for name, _step in self.steps:
            await self.run_step(name, _step)

    async def run_step(self, name, config):
        if name == 'console':
            await self.playground.switch_to('console')
            await asyncio.sleep(2)
            if config.get('clear', True):
                await self.playground.console_command('clear')
            for command in config['commands'].split("\n"):
                if not command.strip():
                    continue
                await self.playground.console_command(command)
                await asyncio.sleep(1)
            if config.get('snap'):
                await self.playground.snap(config['snap'])
        else:
            await getattr(self.playground, name)(**config)


@pytest.mark.parametrize("example", ['front-proxy'])
@pytest.mark.screenshots
@pytest.mark.asyncio
async def test_journey_simple_front_proxy(playground, example):
    itest = IntegrationTest(
        playground,
        f'tests/journeys/{example}.yaml')
    await itest.run()
