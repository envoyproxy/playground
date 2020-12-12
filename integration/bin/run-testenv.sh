#!/bin/bash -E

if [[ -z "$CI" ]]; then
    tty=("-ti")
fi

echo "Starting selenium client test environment"
docker run --rm \
       --net host \
       "${tty[@]}" \
       -v /code/bin/entrypoint.sh:/entrypoint.sh \
       -v /code/tests:/tests \
       -v /code/pytest.ini:/pytest.ini \
       -v /code/artifacts:/artifacts \
       --entrypoint /entrypoint.sh \
       python:3.8-slim "$@"
echo
