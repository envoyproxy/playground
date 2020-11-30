
Install Envoy Playground
========================

Requirements
------------

You will need a recent version of Docker installed and runnable by the user running the playground.

Version 19.0.3 is well tested.


Install and run with Docker
---------------------------

You can run the playground directly with Docker.

.. warning::

   Exposing the playground to the internet could create an open proxy and allow unknown users to run playground
   databases and services.

   The playground container must be run in privileged mode and with access to the Docker socket.

   It requires these permissions in order to start and stop proxy and service containers, and attach their networks.


.. code-block:: console

   $ docker run -d --rm \
		--privileged \
		-v /var/run/docker.sock:/var/run/docker.sock \
		   phlax/envoy-playground:0.1.1-alpha
