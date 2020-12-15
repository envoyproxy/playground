#!/bin/bash -E

pip install selenium pytest-asyncio pytest-selenium aiodocker aiohttp

exec "$@"
