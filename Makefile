#!/usr/bin/make -f

SHELL := /bin/bash

PLAYGROUND_VERSION :=$$(file < VERSION)

.PHONY: coverage docs site build

version:
	echo $$(cat VERSION)

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
	pip install .[docs]
	mkdir tmp/ -p
	rm -rf tmp/docs
	rm -rf build/site
	mkdir -p build
	cp -a docs tmp
	cp -a VERSION tmp/docs
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
	docker pull phlax/envoy-playground:$$(cat VERSION)
	docker run -d \
		--name envoy-playground \
		--privileged \
		-p 8000:8080 \
		-v /var/run/docker.sock:/var/run/docker.sock \
		phlax/envoy-playground:$$(cat VERSION)

shell:
	docker run -it --rm \
		--workdir /code \
		--entrypoint /bin/bash \
			envoy-playground

build:
	docker build -t envoy-playground .

publish:
	docker tag envoy-playground phlax/envoy-playground:$$(cat VERSION)
	docker push phlax/envoy-playground:$$(cat VERSION)

coverage:
	bash <(curl -s https://codecov.io/bash)

exec:
	docker exec -it --workdir /code envoy-playground bash

test:
	./bin/runtests.sh

integration-clean:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose stop integration

integration-test: integration-clean
	mkdir -p tmp/docker
	docker save envoy-playground | gzip > tmp/docker/playground.tar.gz
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose up --build -d integration-start
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose exec -T integration sh -c "CI=1 ./bin/runtests.sh"

dev-integration: clean
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose up --build -d integration
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose exec integration bash

screenshots: integration-clean
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose up --build -d integration
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose exec integration ./bin/start-playground.sh
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose exec integration ./bin/start-selenium.sh
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose exec integration ./bin/run-testenv.sh /bin/bash

dev-control: clean
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose build control
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 8000:8080 \
			control

dev-control-sh:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose build control
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 8000:8080 \
			control /bin/bash

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
		-p 5555:3000 \
			ui sh

dev-site:
	COMPOSE_FILE=./composition/docker-compose.yaml docker-compose run \
		--rm \
		-p 7777:3000 \
			site yarn start
