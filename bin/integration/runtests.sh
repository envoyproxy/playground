#!/bin/bash -E

echo "Run integration tests..."

echo "Load or pull playground image"

./bin/start-playground.sh
./bin/start-selenium.sh
./bin/run-testenv.sh pytest --driver Remote --capability browserName firefox -v /tests/
echo "Done"
