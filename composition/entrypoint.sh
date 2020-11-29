#!/bin/bash -e


if [[ -n "$CI" ]]; then
    pip install -q .
else
    pip install -q -e .
fi

pip install -q '.[test]'

exec "$@"
