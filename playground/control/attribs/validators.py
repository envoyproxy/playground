
from collections import OrderedDict

import attr

import yaml


# im really surprised this is not there in lib
@attr.s(repr=False, slots=True, hash=True)
class _LengthValidator(object):
    _repr = "<instance_of validator for length {length!r}>"

    length = attr.ib()

    _err_gt = (
        "'{name}' must be longer than {length!r} (got {value!r} with length "
        "{actual!r}).")
    _err_gte = (
        "'{name}' must be longer or equal to {length!r} "
        "(got {value!r} with length "
        "{actual!r}).")
    _err_lt = (
        "length of '{name}' must be less than {length!r} "
        "(got {value!r} with length "
        "{actual!r}).")
    _err_lte = (
        "length of '{name}' must be less than or equal to {length!r} "
        "(got {value!r} with length "
        "{actual!r}).")
    _err_eq = (
        "length of '{name}' must be equal to {length!r} "
        "(got {value!r} with length "
        "{actual!r}).")

    def __call__(self, inst, attr, value):
        if self.length.startswith('>='):
            return self._gte(inst, attr, value)
        elif self.length.startswith('<='):
            return self._lte(inst, attr, value)
        elif self.length.startswith('>'):
            return self._gt(inst, attr, value)
        elif self.length.startswith('<'):
            return self._lt(inst, attr, value)
        return self._eq(inst, attr, value)

    def __repr__(self):
        return self._repr.format(length=self.length)

    def _type_error(self, msg, attr, value, length):
        return TypeError(
            msg.format(
                name=attr.name,
                length=length,
                actual=len(value),
                value=value),
            attr,
            self.length,
            value)

    def _gt(self, inst, attr, value):
        if not len(value) > int(self.length.strip('>')):
            raise self._type_error(
                self._err_gt,
                attr,
                value,
                self.length.strip('>'))

    def _gte(self, inst, attr, value):
        if not len(value) >= int(self.length.strip('>=')):
            raise self._type_error(
                self._err_gte,
                attr,
                value,
                self.length.strip('>='))

    def _lt(self, inst, attr, value):
        if not len(value) < int(self.length.strip('<')):
            raise self._type_error(
                self._err_lt,
                attr,
                value,
                self.length.strip('<'))

    def _lte(self, inst, attr, value):
        if not len(value) <= int(self.length.strip('<=')):
            raise self._type_error(
                self._err_lte,
                attr,
                value,
                self.length.strip('<='))

    def _eq(self, inst, attr, value):
        if not len(value) == int(self.length):
            raise self._type_error(
                self._err_eq,
                attr,
                value,
                self.length)


def has_length(length):
    return _LengthValidator(length)


# this may not be useful - may be due to lack of understanding of attrs
# seems useful to me, and gets things moving for now
@attr.s(repr=False, slots=True, hash=True)
class _AllMembersValidator(object):
    _repr = "<instance_of validator for membership test {members!r}>"
    members = attr.ib()

    def __call__(self, inst, attr, value):
        """
        We use a callable class to be able to change the ``__repr__``.
        """
        _iter = value
        if isinstance(value, (dict, OrderedDict)):
            _iter = value.items()
        for member in _iter:
            if not self.members(member):
                raise TypeError(
                    "'{name}' member did not match requirements "
                    "(got {value!r})".format(
                        name=attr.name,
                        value=member,
                    ),
                    attr,
                    member)

    def __repr__(self):
        return self._repr.format(members=self.members)


def all_members(membertest):
    return _AllMembersValidator(membertest)


@attr.s(repr=False, slots=True, hash=True)
class _WellFormedStringValidator(object):
    _repr = "<instance_of validator for well-formed string {string_type!r}>"
    string_type = attr.ib()

    def __call__(self, inst, attr, value):
        return getattr(self, f'valid_{self.string_type}')(inst, attr, value)

    def valid_yaml(self, inst, attr, value):
        try:
            yaml.safe_load(value)
        except yaml.parser.ParserError:
            raise TypeError(
                "'{name}' Unable to parse as {string_type}".format(
                    name=attr.name,
                    string_type=self.string_type),
                attr,
                self.string_type,
                value)

    def __repr__(self):
        return self._repr.format(members=self.members)


def is_well_formed(membertest):
    return _WellFormedStringValidator(membertest)
