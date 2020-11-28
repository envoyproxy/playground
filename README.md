# Envoy playground

[![codecov](https://codecov.io/gh/envoyproxy/playground/branch/main/graph/badge.svg)](https://codecov.io/gh/envoyproxy/playground)

The Envoy playground allows you to experiment with proxies, services and networks using Docker.

This is useful for learning or testing Envoy configurations and network architectures.

It is not (at least with current focus) intended to be exposed on the internet or other network.

Exposing the playground to the internet could create an open proxy and allow unknown users to run playground
databases and services.

## Install

---
> :smiley: **The playground is currently in alpha development.**
>
> It should mostly work and do no harm, but may have bugs
>
> Contributions/issues are welcome.
---

### Requirements

You will need a recent version of Docker installed and runnable by the user running the playground.

Version 19.0.3 is well tested.

### Run with Docker

You can run the playground directly with Docker.

---
> :warning: The playground container must be run in privileged mode
> and with access to the Docker socket.
>
> It requires these permissions in order to start and stop proxy
> and service containers, and attach their networks.
---

```console
$ docker run -d --rm \
	--privileged \
	-v /var/run/docker.sock:/var/run/docker.sock \
	phlax/envoy-playground:0.1-alpha
```

You can stop the playground with.

```console
$ docker stop envoy-playground
```

---
> :bulb: This will not stop any services, proxies or networks that you started with the playground.
---

## Usage

Start the container and browse to http://localhost:8000

### Create Envoy proxies

Add Envoy proxies and set their configuration.

https://phlax.github.io/playground/docs/screencasts/create-proxies.webm

### Create some services

Add some services to the playground.

### Create some networks and connect services and proxies

Connect the proxies and services with networks.

### Test edge connections

Test out connectivity of ports that are exposed to your (localhost) edges.

### Remove proxies, services and networks

Remove an Envoy proxy, service or network from  the playground.

### Clear the deck

Clear all of the toys away.

## Development

### Clone the git repo

```console
$ git clone git@github.com:envoyproxy/playground
$ cd playground
```

### Start the control and ui servers in dev mode

To start the control server (python API and websocket).

```
$ make dev-control
```

To start the ui (webpack-dev-server)


```
$ make dev-ui
```

In dev mode the playground should be available at http://localhost:5555

You can optionally also start continuous javascript testing.

```
$ make dev-ui-test
```

### Run tests

```
$ make test
```

### Build the playground image

This will generate a production image named `envoy-playground`.

```console
$ make build
```

### Run the built image

This will run the built production `envoy-playground` image.

The playground will be available on http://localhost:8000.

```
$ make run
```

See the [Makefile](Makefile) for further commands, and other usage.
