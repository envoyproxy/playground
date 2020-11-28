
from playground.control import attribs, request

from aiohttp.web import Request


class DummyRequest(Request):

    def __init__(self):
        pass


class DummyAttribs(attribs.Attribs):

    def __init__(self):
        pass


def test_request():
    dummy_request = DummyRequest()
    _request = request.PlaygroundRequest(dummy_request)
    assert _request._request is dummy_request
    assert _request._attribs is None

    dummy_attribs = DummyAttribs()
    _request = request.PlaygroundRequest(dummy_request, dummy_attribs)
    assert _request._request is dummy_request
    assert _request._attribs is dummy_attribs
