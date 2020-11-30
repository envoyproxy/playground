# -*- coding: utf-8 -*-

from playground.control.runner import PlaygroundRunner


CORS_ALLOWED = "http://localhost:5555"

ENDPOINTS = (
    ("/resources", "dump_resources"),
    ("/events", "events"),
    ("/clear", "clear"),
    ("/network/add", "network_add", "POST"),
    ("/network/edit", "network_edit", "POST"),
    ("/network/delete", "network_delete", "POST"),
    ("/proxy/add", "proxy_add", "POST"),
    ("/proxy/delete", "proxy_delete", "POST"),
    ("/service/add", "service_add", "POST"),
    ("/service/delete", "service_delete", "POST"))


def main() -> None:
    PlaygroundRunner(ENDPOINTS, CORS_ALLOWED).run()
