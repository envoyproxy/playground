#!/bin/bash -e


pip install -q -e .
pip install -q -e '.[test]'

exec "$@"
