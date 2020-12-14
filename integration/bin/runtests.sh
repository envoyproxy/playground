#!/bin/bash -e

echo ">>> Create integration test environment"
echo

./bin/start-playground.sh
./bin/start-selenium.sh
./bin/run-testenv.sh pytest

echo
echo ">>> Done"
