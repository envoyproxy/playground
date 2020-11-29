#!/bin/bash -e


if [[ -n "$CI" ]]; then
    pip install -q '.[test]'
    pip install -q .
else
    pip install -q -e .
fi

exec "$@"
