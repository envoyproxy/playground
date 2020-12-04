#!/bin/bash

LOGGING=()

if [[ -n "$ENVOY_LOG_LEVEL" ]]; then
    LOGGING=(-l "$ENVOY_LOG_LEVEL")
fi

exec /usr/local/bin/envoy -c /etc/envoy/envoy.yaml --restart-epoch "$RESTART_EPOCH" "${LOGGING[@]}"
