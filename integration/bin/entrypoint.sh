#!/bin/bash -E

pip install pytest-asyncio aiodocker aiohttp aioselenium pyquery pyyaml

exec "$@"
