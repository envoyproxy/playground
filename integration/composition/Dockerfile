ARG BUILD_FROM=docker:dind

FROM $BUILD_FROM

RUN apk add bash curl docker-compose git jq

RUN mkdir /code
COPY bin /code/bin

HEALTHCHECK --interval=10s --timeout=5s --retries=20 \
        CMD find /var/run/docker.sock -type s | grep docker.sock
