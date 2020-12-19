#!/bin/bash -E


echo ">>> Start wetty"
docker run --rm \
       -d \
       --net host \
       phlax/wetty
echo
