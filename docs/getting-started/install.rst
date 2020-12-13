
Install Envoy Playground
========================

There are two methods of running the playground described here.

The first is the easiest way, but as the playground requires the ability to build and run Docker containers and networks,
it requires both to be run in ``--privileged`` mode and have access to the host ``/var/run/docker.sock``.

Running any container with ``--privileged`` mode allows the process inside the container to escalate privileges to root
on the host. Having access to the docker socket makes this trivial.

The second way of running described here does not use the host Docker process.

Instead it creates a container running Docker in rootless mode, and then starts the playground inside this container.

While this method still requires ``--privileged`` mode, it at least provides a measure of isolation between the playground
and the host system.

.. warning::

   Exposing the playground to the internet could create an open proxy and allow unknown users to run playground
   databases and services.

Requirements
------------

You will need a recent version of Docker installed and runnable by the user running the playground.

Version 19.0.3 is well tested.


Install and run `with` Docker
-----------------------------

You can run the playground directly with Docker.


.. substitution-code-block:: console

   $ docker run -d --rm \
		--privileged \
		-v /var/run/docker.sock:/var/run/docker.sock \
		   phlax/envoy-playground:|playground_version|-alpha

.. warning::

   The playground container must be run in privileged mode and with access to the Docker socket.

   It requires these permissions in order to start and stop proxy and service containers, and attach their networks.


Install and run `in` Docker
---------------------------

The second method of running the playground is to run it inside a Docker container.

Although slightly more complex, this way can be more secure.

The ``docker-in-docker`` rootless image requires the kernel
``unprivileged_userns_clone`` to be set to ``1``.

You can achieve this for a running session with:

.. code-block:: console

   $ echo 1 | sudo tee /proc/sys/kernel/unprivileged_userns_clone

Next, start a ``docker-in-docker`` rootless container in daemon mode.

Any ports exposed by proxies inside the container that you want to access need to be
mapped. It is better not to map a large range of ports in this way.

Access to the playground port ``8000`` is also required.

.. code-block:: console

   $ docker run --name in-docker \
		--rm -d \
		--privileged \
		-p 10000-10020:10000-10020 \
		-p 8000:8000 \
		docker:20-dind-rootless
   f57daff5d0e16f20b48e90e41538bca0a31e88dc4a46c7b5782781d985fd472d

   $ docker ps
   CONTAINER ID  IMAGE                    COMMAND                 CREATED         STATUS         PORTS
   f57daff5d0e1  docker:20-dind-rootless  "dockerd-entrypoint.…"  19 seconds ago  Up 16 seconds  0.0.0.0:8000->8000/tcp, 2375-2376/tcp, 0.0.0.0:10000-10020->10000-10020/tcp  in-docker

Wait a few seconds for the Docker process to start inside the container, and
then start the playground.

.. substitution-code-block:: console

   $ docker exec in-docker sh -c '\
	     docker run -d --rm \
		--privileged \
		--host=unix:///run/user/1000/docker.sock \
		-p 8000:8080 \
		-v /run/user/1000/docker.sock:/var/run/docker.sock \
		   phlax/envoy-playground:|playground_version|-alpha'
   f01684843c27385eddb9f89d703d0c16137e4480a6377deb0a753e34d730c0e1

You should now be able to access the playground UI on http://localhost:8000

To stop the playground, and all containers

.. code-block:: console

   $ docker stop in-docker
   in-docker

.. note::

   Unlike when running the playground `with` Docker all containers are stopped
   when the ``docker-in-docker`` container is stopped.

.. tip::

   You can cache the Docker images used by the ``docker-in-docker`` container by mounting a directory to
   the ``/var/lib/docker`` mount point inside the container.

   For example, you could start it with:

   .. code-block:: console

      $ docker run --name in-docker \
		   --rm -d \
		   --privileged \
		   -p /tmp/docker-images:/var/lib/docker \
		   -p 10000-10020:10000-10020 \
		   -p 8000:8000 \
		   docker:20-dind-rootless
      9d817ed1047d3b092347aca180333987ef22dde4b384106f78ff929beb0b45ed

   This will make loading proxies and services faster on subsequent use of the playground.
