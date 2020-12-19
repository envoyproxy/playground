#!/bin/bash -E


echo ">>> Start wetty"
docker pull phlax/wetty
docker run --rm \
       -d \
       --net host \
       phlax/wetty
echo
