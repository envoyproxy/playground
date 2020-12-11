#!/bin/bash -E

pip install selenium pytest-selenium

exec "$@"
