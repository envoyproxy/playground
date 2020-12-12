#!/bin/bash -e

pip install -q -e '.[test]'
pip install -q -e .

exec "$@"
