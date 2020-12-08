#!/bin/bash -e

pip install -q '.[test]'
pip install -q -e .

exec "$@"
