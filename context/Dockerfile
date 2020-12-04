ARG BUILD_FROM=envoyproxy/envoy-dev:latest

FROM $BUILD_FROM

RUN apt-get update \
	&& apt-get install -y -qq --no-install-recommends \
	       curl \
	       dnsutils \
               iputils-ping \
	       python-minimal

ENV ENVOY_UID=0

COPY hot-restarter.py /hot-restarter.py
COPY start_envoy.sh /start_envoy.sh
