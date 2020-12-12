#!/bin/bash -E

echo "Run integration tests..."

echo "Load or pull playground image"


if [[ -e /tmp/docker/playground.tar.gz ]]; then
    docker load < /tmp/docker/playground.tar.gz
else
    docker pull phlax/envoy-playground:0.2.4-alpha
    docker tag phlax/envoy-playground:0.2.4-alpha envoy-playground
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
