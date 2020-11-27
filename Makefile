#!/usr/bin/make -f

SHELL := /bin/bash

export PLAYGROUND_VERSION=0.0.5-alpha

.PHONY: coverage

clean:
	docker rm -f $$(docker ps -a -q -f "name=envoy-playground") || :

run: clean
	docker run -d \
		--name envoy-playground \
		--privileged \
		-p 8000:8080 \
		-v /var/run/docker.sock:/var/run/docker.sock \
		envoy-playground

run-published: clean
	docker pull phlax/envoy-playground:$$PLAYGROUND_VERSION
	docker run -d \
		--name envoy-playground \
		--privileged \
		-p 8000:8080 \
		-v /var/run/docker.sock:/var/run/docker.sock \
		phlax/envoy-playground:$$PLAYGROUND_VERSION

shell:
	docker run -it --rm \
		--workdir /code \
		--entrypoint /bin/bash \
			envoy-playground

build:
	docker build -t envoy-playground .

publish:
	docker tag envoy-playground phlax/envoy-playground:$$PLAYGROUND_VERSION
	docker push phlax/envoy-playground:$$PLAYGROUND_VERSION

coverage:
	bash <(curl -s https://codecov.io/bash)

exec:
	docker exec -it --workdir /code envoy-playground bash

test:
	./scripts/runtests.sh

dev-control: clean
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose build control
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
		--rm \
		-p 8000:8080 \
			control

dev-control-sh:
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
		--rm \
		--entrypoint /bin/bash \
			control

dev-ui:
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
		--rm \
		-p 5555:3000 \
			ui yarn start

dev-ui-test:
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
		--rm \
		ui yarn test

dev-ui-sh:
	COMPOSE_FILE=./dev/docker-compose.yaml docker-compose run \
		--rm \
		ui sh
