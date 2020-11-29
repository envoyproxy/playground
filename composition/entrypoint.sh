#!/bin/bash -e


pip install -q '.[test]'

if [[ -n "$CI" ]]; then
    pip install -q .
else
    pip install -q -e .
fi

exec "$@"
