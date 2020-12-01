#!/usr/bin/make -f

SHELL := /bin/bash

export PLAYGROUND_VERSION=0.1.2-alpha

.PHONY: coverage docs site build

clean:
	docker rm -f $$(docker ps -a -q -f "name=envoy-playground") 2> /dev/null || :

docs:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose build docs
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
			docs

site:
	echo "Building site..."
	pip install -U pip setuptools
	pip install -r docs/requirements.txt
	mkdir tmp/ -p
	rm -rf tmp/docs
	rm -rf build/site
	mkdir -p build
	cp -a docs tmp
	pwd
	ls bin
	./bin/generate-docs.py tmp/docs services/services.yaml
	sphinx-build -W --keep-going -b dirhtml tmp/docs build/site/docs
	npm install -g yarn
	cd site && yarn install && yarn build
	cp -a site/build/* build/site

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
	./bin/runtests.sh

dev-control: clean
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose build control
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 8000:8080 \
			control

dev-control-sh:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		--entrypoint /bin/bash \
			control

dev-ui:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 5555:3000 \
			ui yarn start

dev-ui-test:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		ui yarn test

dev-ui-sh:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		ui sh

dev-site:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 7777:3000 \
			site yarn start
