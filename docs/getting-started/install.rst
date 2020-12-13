
Install Envoy Playground
========================

There are two methods of running the playground described here.

The first is the easiest way, but as the playground requires the ability to build and run Docker containers and networks,
it requires both to be run in ``--privileged`` mode and access to the host ``/var/run/docker.sock``.

Running any container with ``--privileged`` mode allows the process inside the container to escalate privileges to root
on the host. Having access to the docker socket makes this trivial.

The second way of running described here does not use the host Docker process.

Instead it creates a container running Docker in rootless mode, and then starts the playground inside this container.

While this method still requires ``--privileged`` mode, it at least provides a measure of isolation between the playground
and the host system.

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

   Exposing the playground to the internet could create an open proxy and allow unknown users to run playground
   databases and services.

   The playground container must be run in privileged mode and with access to the Docker socket.

   It requires these permissions in order to start and stop proxy and service containers, and attach their networks.


Install and run `in` Docker
---------------------------

The second method of running the playground is to run it inside a Docker container.

Although slightly more complex, this way can be more secure.

The first thing we need is to start a ``docker-in-docker`` container in daemon mode.

We need to provide access to a range or ports inside this container so we can still
access any edge ports exposed by proxies in the playground.

We also need to provide access to the playground port ``8000``

.. code-block:: console

   $ docker run --name in-docker --rm -d \
		-p 10000-30000:10000-30000 \
		-p 8000:8000 \
		docker
   ...

You will need to wait a few seconds for the container to become healthy

.. code-block:: console

   $ docker ps
   ...

Once the Docker container is healthy, we can tell it to start the playground.

.. substitution-code-block:: console

   $ docker exec in-docker sh -c "\
	     docker run -d --rm \
		--privileged \
		-v /var/run/docker.sock:/var/run/docker.sock \
		   phlax/envoy-playground:|playground_version|-alpha"
   ...

You should now be able to access the playground UI on http://localhost:8000

To stop the playground, and all containers

.. code-block:: console

   $ docker stop in-docker
   ...


.. note::

   Unlike when running the playground `with` Docker all containers are stopped
   when the ``docker-in-docker`` container is stopped.


.. tip::

   You can cache the Docker images used by the ``docker-in-docker`` container by mounting a directory to
   the ``/var/lib/docker`` mount point inside the container.

   For example, you could start it with:

   .. code-block:: console

      $ docker run --name in-docker --rm -d \
		   -p /tmp/docker-images:/var/lib/docker \
		   -p 10000-30000:10000-30000 \
		   -p 8000:8000 \
		   docker
      ...

   This will make loading proxies and services faster on subsequent use of the playground.
