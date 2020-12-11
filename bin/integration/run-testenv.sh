#!/bin/bash -E

if [[ -z "$CI" ]]; then
    tty=("-ti")
fi

echo "Running selenium tests"
docker run --rm \
       --net host \
       "${tty[@]}" \
       -v /code/tmp:/tmp/tests \
       -v /code/bin/entrypoint.sh:/entrypoint.sh \
       -v /code/tests:/tests \
       --entrypoint /entrypoint.sh \
       python:3.8-slim "$@"
