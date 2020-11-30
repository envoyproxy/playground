#!/bin/bash -e

pip install -q .[docs]

rm -rf build/docs
rm -rf build/site/docs

exec "$@"
