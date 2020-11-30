
from playground.control import attribs, event


class DummyAttribs(attribs.ValidatingAttribs):

    def __init__(self):
        pass


def test_event():
    _kwargs = dict()
    _event = event.PlaygroundEvent(_kwargs)
    assert _event._kwargs is _kwargs
    assert _event._attribs is None

    dummy_attribs = DummyAttribs()
    _event = event.PlaygroundEvent(_kwargs, dummy_attribs)
    assert _event._kwargs is _kwargs
    assert _event._attribs is dummy_attribs
