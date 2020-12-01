#!/bin/bash -E

echo "Run integration tests..."


echo "Start playground"
docker run -d \
       --rm \
       --name envoy-playground \
       --privileged \
       -p 8000:8080 \
       -v /var/run/docker.sock:/var/run/docker.sock \
          phlax/envoy-playground:0.1.2-alpha

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
        sh -c 'pip install selenium && python /tests/playground.py'

echo "Done"
