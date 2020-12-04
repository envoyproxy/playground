
Basic concepts
==============

There is only one way into the playground, through proxies.

Proxies can be configured for any type of proxying that Envoy is capable of.

Services provide endpoints inside the playground.

Service endpoints can be exposed by proxies or they can provide services to proxies or other services inside the playground.

Proxies can proxy between services and other proxies, as well as proxying into the playground.

Proxies and services are connected together with networks.

The name provided for the proxy or service is the name upon which it is addressable by other proxies or services on any
networks it is connected to.

All proxies and services are ephemeral.

When a proxy or service is stopped all logs and data are removed.
