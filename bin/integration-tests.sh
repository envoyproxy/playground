#!/bin/bash -E

echo "Run integration tests..."

echo "Load or pull playground image"

if [[ -e /tmp/docker/playground.tar.gz ]]; then
    docker load < /tmp/docker/playground.tar.gz
else
    docker pull phlax/envoy-playground:0.2.0-alpha
    docker tag phlax/envoy-playground:0.2.0-alpha envoy-playground
fi

docker images

echo "Start playground"
docker run -d \
       --rm \
       --name envoy-playground \
       --privileged \
       -p 8000:8080 \
       -v /var/run/docker.sock:/var/run/docker.sock \
          envoy-playground

echo "Start selenium"
docker run --rm \
       -d \
       --net host \
       --shm-size 2g \
       selenium/standalone-firefox:4.0.0-beta-1-prerelease-20201130

echo "Snoozing while they start..."
sleep 30

echo "Running selenium tests"
docker run --rm \
       --net host \
       -v /tests:/tests \
       python:3.8-slim \
        sh -c "\
	   pip install selenium pytest-selenium \
	   && pytest --driver Remote \
	      	     --capability browserName firefox \
		     -v \
		     /tests"

echo "Done"
