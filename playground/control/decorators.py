# -*- coding: utf-8 -*-

import asyncio

from functools import partial, update_wrapper, wraps
from typing import Callable, Optional, Type

import rapidjson as json  # type: ignore

from aiohttp import web

from playground.control.attribs import ValidatingAttribs
from playground.control.command import PlaygroundCommand
from playground.control.event import PlaygroundEvent
from playground.control.exceptions import (
    PlaygroundError, PlaygroundValidationError)
from playground.control.request import PlaygroundRequest


def api(original_fun: Callable = None,
        attribs: Optional[Type[ValidatingAttribs]] = None) -> Callable:

    def _api(fun: Callable) -> Callable:

        @wraps(fun)
        async def wrapped_fun(request: web.Request) -> web.Response:
            _request = PlaygroundRequest(request, attribs=attribs)
            if not attribs:
                response = await fun(_request)
                return web.json_response(
                    (response
                     if response is not None
                     else dict(message="OK")),
                    dumps=json.dumps)
            try:
                await _request.load_data()
            except (TypeError, ValueError) as e:
                if len(e.args) > 1:
                    errors = json.dumps(
                        dict(errors={e.args[1].name: e.args[0]}))
                else:
                    errors = json.dumps(
                        dict(errors={'playground': e.args[0]}))
                return web.HTTPBadRequest(
                    reason="Invalid request data",
                    body=errors,
                    content_type='application/json')
            try:
                response = await fun(_request)
                return web.json_response(
                    (response
                     if response is not None
                     else dict(message="OK")),
                    dumps=json.dumps)
            except PlaygroundError as e:
                errors = json.dumps(
                    dict(errors={e.args[1].name: e.args[0]}))
                return web.HTTPBadRequest(
                    reason="Invalid request data",
                    body=errors,
                    content_type='application/json')
        return wrapped_fun

    if original_fun:
        return _api(original_fun)

    return _api


def cmd(original_fun: Callable = None,
        attribs: Optional[Type[ValidatingAttribs]] = None,
        sync: bool = False) -> Callable:

    def _cmd(fun: Callable) -> Callable:

        @wraps(fun)
        async def wrapped_fun(kwargs: dict = {}) -> None:
            cmd = PlaygroundCommand(kwargs, attribs=attribs)
            if attribs:
                # todo: improve error handling
                try:
                    await cmd.load_data()
                except (TypeError, ValueError) as e:
                    if len(e.args) > 1:
                        errors = json.dumps(
                            dict(errors={e.args[1].name: e.args[0]}))
                    else:
                        errors = json.dumps(
                            dict(errors={'playground': e.args[0]}))
                    raise PlaygroundValidationError(errors)
            _cmd = (
                fun(cmd)
                if kwargs
                else fun())
            if sync:
                return await _cmd
            asyncio.create_task(_cmd)
        return wrapped_fun

    if original_fun:
        return _cmd(original_fun)

    return _cmd


def handler(
        original_fun: Callable = None,
        attribs: Optional[Type[ValidatingAttribs]] = None) -> Callable:

    def _handler(fun: Callable) -> Callable:

        @wraps(fun)
        async def wrapped_fun(kwargs: dict = {}) -> None:
            event = PlaygroundEvent(
                kwargs,
                attribs=attribs)
            if attribs:
                # todo: improve error handling
                try:
                    await event.load_data()
                except (TypeError, ValueError) as e:
                    if len(e.args) > 1:
                        errors = json.dumps(
                            dict(errors={e.args[1].name: e.args[0]}))
                    else:
                        errors = json.dumps(
                            dict(errors={'playground': e.args[0]}))
                    raise PlaygroundValidationError(errors)
            return await (
                fun(event)
                if kwargs
                else fun())
        return wrapped_fun

    if original_fun:
        return _handler(original_fun)

    return _handler


def transmit(
        original_fun: Callable = None,
        attribs: Optional[Type[ValidatingAttribs]] = None) -> Callable:

    def _publish(fun: Callable) -> Callable:

        @wraps(fun)
        async def wrapped_fun(kwargs: dict = {}) -> None:
            event = PlaygroundEvent(
                kwargs,
                attribs=attribs)
            if attribs:
                # todo: improve error handling
                try:
                    await event.load_data()
                except (TypeError, ValueError) as e:
                    if len(e.args) > 1:
                        errors = json.dumps(
                            dict(errors={e.args[1].name: e.args[0]}))
                    else:
                        errors = json.dumps(
                            dict(errors={'playground': e.args[0]}))
                    raise PlaygroundValidationError(errors)
            return await (
                fun(event)
                if kwargs
                else fun())
        return wrapped_fun

    if original_fun:
        return _publish(original_fun)

    return _publish


# Method decoration taken from the django project
def _update_method_wrapper(_wrapper, decorator):
    # _multi_decorate()'s bound_method isn't available in this scope. Cheat by
    # using it on a dummy function.
    @decorator
    def dummy(*args, **kwargs):
        pass
    update_wrapper(_wrapper, dummy)


def _multi_decorate(decorators, method):
    """
    Decorate `method` with one or more function decorators. `decorators` can be
    a single decorator or an iterable of decorators.
    """
    if hasattr(decorators, '__iter__'):
        # Apply a list/tuple of decorators if 'decorators' is one. Decorator
        # functions are applied so that the call order is the same as the
        # order in which they appear in the iterable.
        decorators = decorators[::-1]
    else:
        decorators = [decorators]

    def _wrapper(self, *args, **kwargs):
        # bound_method has the signature that 'decorator' expects i.e. no
        # 'self' argument, but it's a closure over self so it can call
        # 'func'. Also, wrap method.__get__() in a function because new
        # attributes can't be set on bound method objects, only on functions.
        bound_method = partial(method.__get__(self, type(self)))
        for dec in decorators:
            bound_method = dec(bound_method)
        return bound_method(*args, **kwargs)

    # Copy any attributes that a decorator adds to the function it decorates.
    for dec in decorators:
        _update_method_wrapper(_wrapper, dec)
    # Preserve any existing attributes of 'method', including the name.
    update_wrapper(_wrapper, method)
    return _wrapper


def method_decorator(decorator, name=''):
    """
    Convert a function decorator into a method decorator
    """
    # 'obj' can be a class or a function. If 'obj' is a function at the time it
    # is passed to _dec,  it will eventually be a method of the class it is
    # defined on. If 'obj' is a class, the 'name' is required to be the name
    # of the method that will be decorated.
    def _dec(obj):
        if not isinstance(obj, type):
            return _multi_decorate(decorator, obj)
        if not (name and hasattr(obj, name)):
            raise ValueError(
                "The keyword argument `name` must be the name of a method "
                "of the decorated class: %s. Got '%s' instead." % (obj, name)
            )
        method = getattr(obj, name)
        if not callable(method):
            raise TypeError(
                "Cannot decorate '%s' as it isn't a callable attribute of "
                "%s (%s)." % (name, obj, method)
            )
        _wrapper = _multi_decorate(decorator, method)
        setattr(obj, name, _wrapper)
        return obj

    # Don't worry about making _dec look similar to a list/tuple as it's rather
    # meaningless.
    if not hasattr(decorator, '__iter__'):
        update_wrapper(_dec, decorator)
    # Change the name to aid debugging.
    obj = decorator if hasattr(decorator, '__name__') else decorator.__class__
    _dec.__name__ = 'method_decorator(%s)' % obj.__name__
    return _dec
