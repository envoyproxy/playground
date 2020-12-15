#!/bin/bash -E


if [[ -e /code/docker/playground.tar.gz ]]; then
    echo ">>> Loading playground image from build file"
    docker load < /code/docker/playground.tar.gz
elif [[ -n "$PLAYGROUND_VERSION" ]]; then
    echo ">>> Pulling playground: ${PLAYGROUND_VERSION}"
    docker pull "phlax/envoy-playground:${PLAYGROUND_VERSION}"
    docker tag "phlax/envoy-playground:${PLAYGROUND_VERSION} envoy-playground"
else
    echo "ERROR: Need either an image or a version to pull, can't continue, exiting, bye" >&2
    exit 1
fi

echo ">>> Clearing Docker"
docker system prune -f
docker volume prune -f
docker image prune -f
echo

echo ">>> Current Docker images"
docker images
echo

echo ">>> Start playground"
docker run -d \
       --rm \
       --name envoy-playground \
       --privileged \
       -p 8000:8080 \
       -v /var/run/docker.sock:/var/run/docker.sock \
          envoy-playground
echo
