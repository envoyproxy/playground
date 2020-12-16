#!/bin/bash


echo ">>> Removing playground images"

docker rmi -f redis:latest || :
docker rmi -f envoyproxy/envoy-dev-playground:latest || :
docker rmi -f envoyproxy/envoy-dev:latest || :
docker rmi -f busybox:latest || :
docker rmi -f mendhak/http-https-echo || :
