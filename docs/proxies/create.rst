
.. _proxy_create:

Create an Envoy proxy
=====================

Its easy to create an Envoy proxy in the playground.

Example configurations have been provided, or you can add your own.

.. tip::

   Don't forget to :ref:`add port mappings <proxy_create_port_mappings>` if you wish
   your proxy to be available from outside of the playground.

.. _proxy_create_dialogue::

.. rst-class::  clearfix

Open the create proxy dialogue
------------------------------

..  figure:: ../_static/screenshots/home.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Open the playground, and click on the green ``+`` next to "Proxies".

This should open the proxy create dialogue.

.. rst-class::  inline-tip

.. tip::

   You can use ``ctrl+alt+p`` to open the create new proxy dialogue.

.. _proxy_create_name:

.. rst-class::  clearfix

Enter the proxy name and optionally select a version
----------------------------------------------------

..  figure:: ../_static/screenshots/proxy-create.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Give the proxy a name.

It should be not too long and not too short, 4 or 5 characters is probably best.

The name should only include the characters a-z, 0-9, ``_``, ``-``, and ``.``.

You can also select which version of Envoy to use.

The default is to use the ``envoyproxy/envoy-dev:latest`` container image.

You can ensure you are using the most recently published image by selecting the
"Pull image" checkbox.

.. _proxy_create_configuration:

.. rst-class::  clearfix

Add an Envoy configuration
--------------------------

..  figure:: ../_static/screenshots/proxy-create-name.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Once you have added the name, you will be able to configure the proxy.

At a mimimum you will need to provide an Envoy configuration.

A number of examples have been provided to work with the pre-installed services.


.. _proxy_create_port_mappings:

Add port mappings (optional)
----------------------------

.. _proxy_create_log_level:

Set the log level (optional)
----------------------------

.. _proxy_create_certificates:

Upload certificates for your proxy (optional)
---------------------------------------------

.. _proxy_create_binaries:

Upload binaries for your proxy (optional)
-----------------------------------------


.. _proxy_create_start:

Create and start the proxy
--------------------------
