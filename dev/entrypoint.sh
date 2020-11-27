#!/bin/bash -e


pip install -e .
pip install -e .[test]
exec playground
