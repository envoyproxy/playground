#!/bin/bash -E


echo ">>> Start selenium"
docker run --rm \
       -d \
       --net host \
       --shm-size 2g \
       selenium/standalone-firefox:4.0.0-beta-1-prerelease-20201130
echo
