#!/bin/bash -E

echo "Run integration tests..."

echo "Load or pull playground image"


if [[ -e /tmp/docker/playground.tar.gz ]]; then
    docker load < /tmp/docker/playground.tar.gz
elif [[ -n "$PLAYGROUND_VERSION" ]]; then
    docker pull "phlax/envoy-playground:${PLAYGROUND_VERSION}-alpha"
    docker tag "phlax/envoy-playground:${PLAYGROUND_VERSION}-alpha envoy-playground"
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
