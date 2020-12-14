#!/bin/bash -e

if [[ -z "$CI" ]]; then
    tty=("-ti")
fi

echo "Starting selenium client/test environment"
docker run --rm \
       --net host \
       "${tty[@]}" \
       -v /code/bin/entrypoint.sh:/entrypoint.sh \
       -v /code/tests:/tests \
       -v /code/pytest.ini:/pytest.ini \
       -v /code/artifacts:/artifacts \
       -v /var/run/docker.sock:/var/run/docker.sock \
       --privileged \
       --entrypoint /entrypoint.sh \
       python:3.8-slim "$@"
echo
