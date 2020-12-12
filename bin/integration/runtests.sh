#!/bin/bash -E

echo ">>> Create integration test environment"
echo

./bin/start-playground.sh
./bin/start-selenium.sh
./bin/run-testenv.sh pytest --driver Remote --capability browserName firefox -v /tests/

echo
echo ">>> Done"
