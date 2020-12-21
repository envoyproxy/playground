
.. _journey_front_proxy:

Front proxy with ``http-echo``
==============================

This is one of the simplest setups.

.. _journey_front_proxy_start:

.. rst-class::  clearfix

Create an Envoy proxy using ``HTTP`` echo example
-------------------------------------------------

..  figure:: ../screenshots/journey.front_proxy.proxy.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

You can give the proxy any valid name.

In this example the proxy is named ``proxy0``.

Once you have added the name, you will be able to configure the proxy.

Select the ``Service: HTTP/S echo`` example from the configuration dropdown.

.. _journey_front_proxy_proxy_port_mappings:

.. rst-class::  clearfix

Map ports and start the proxy
-----------------------------

..  figure:: ../screenshots/journey.front_proxy.ports.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

This example exposes three internal ports ``10000``, ``10000`` and ``10002``.

Map each of these to the corresponding external port.


.. _journey_front_proxy_service_create:

.. rst-class::  clearfix


Create an ``HTTP/S echo`` service called ``http-echo0``
-------------------------------------------------------

..  figure:: ../screenshots/journey.front_proxy.service.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

The name given to the service must match the name used in the example configuration.

By default the example configuration uses the the name ``http-echo0``.

Create a service with this name.

.. _journey_front_proxy_network_start:

.. rst-class::  clearfix

Create a network
----------------

..  figure:: ../screenshots/journey.front_proxy.network.name.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

The name given to the network is arbitrary.

In this example  we call the network ``net0``.

.. _journey_front_proxy_network_proxies:

.. rst-class::  clearfix

Add the proxy and service to the network and create
---------------------------------------------------

..  figure:: ../screenshots/journey.front_proxy.network.proxies.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Click on the "Proxies" tab and select "proxy0".

Now do the same for the service you added.


.. _journey_front_proxy_network_started:

.. rst-class::  clearfix

Network created and example is set up
-------------------------------------

..  figure:: ../screenshots/journey.front_proxy.all.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Once the network has been created, the example should be set up, and ready to test.

.. _journey_front_proxy_console_http:

.. rst-class::  clearfix

Open a console and curl upstream ``HTTP/S`` on port ``10000``
-------------------------------------------------------------

..  figure:: ../screenshots/journey.front_proxy.console.http.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right

Open a console and query the ``HTTP`` interface on port ``10000``

.. _journey_front_proxy_console_https:

.. rst-class::  clearfix

Open a console and curl upstream ``HTTP/S`` on port ``10001``
-------------------------------------------------------------

..  figure:: ../screenshots/journey.front_proxy.console.https.png
    :figclass: screenshot with-shadow
    :figwidth: 40%
    :align: right


Open a console and query the ``HTTPS`` interface on port ``10001``
