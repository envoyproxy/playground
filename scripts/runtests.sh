#!/bin/bash -e

mkdir -p .coverage

# JavaScript
COMPOSE_FILE=./dev/docker-compose.yaml docker-compose build ui
COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
	    -e CI=1 \
	    ui yarn install
COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
	    -e CI=1 \
	    ui yarn test --coverage

# Python
COMPOSE_FILE=./dev/docker-compose.yaml docker-compose build control
COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
	    --workdir /code/control \
	    --entrypoint /bin/sh \
	    control -c 'pytest --flake8 --cov=. --cov-append --cov-report=xml:coverage/coverage.xml tests/api.py'
