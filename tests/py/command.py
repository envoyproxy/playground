
from playground.control import attribs, command


class DummyAttribs(attribs.ValidatingAttribs):

    def __init__(self):
        pass


def test_command():
    _kwargs = dict()
    _command = command.PlaygroundCommand(_kwargs)
    assert _command._kwargs is _kwargs
    assert _command._attribs is None

    dummy_attribs = DummyAttribs()
    _command = command.PlaygroundCommand(_kwargs, dummy_attribs)
    assert _command._kwargs is _kwargs
    assert _command._attribs is dummy_attribs
