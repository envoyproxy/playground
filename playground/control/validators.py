import attr


# im really surprised this is not there in lib
@attr.s(repr=False, slots=True, hash=True)
class _LengthValidator(object):
    length = attr.ib()

    def _gt(self, inst, attr, value):
        if not len(value) > int(self.length.strip('>')):
            raise TypeError(
                "'{name}' must be longer than {length!r} (got {value!r} that is "
                "{actual!r}).".format(
                    name=attr.name,
                    length=self.length.strip('>'),
                    actual=value.__class__,
                    value=value,
                ),
                attr,
                self.length,
                value)


    def _gte(self, inst, attr, value):
        if not len(value) >= int(self.length.strip('>=')):
            raise TypeError(
                "'{name}' must be longer or equal to {length!r} (got {value!r} that is "
                "{actual!r}).".format(
                    name=attr.name,
                    length=self.length.strip('>='),
                    actual=value.__class__,
                    value=value,
                ),
                attr,
                self.length,
                value)

    def _lt(self, inst, attr, value):
        if not len(value) < int(self.length.strip('<')):
            raise TypeError(
                "length of '{name}' must be less than {length!r} (got {value!r} that is "
                "{actual!r}).".format(
                    name=attr.name,
                    length=self.length.strip('<'),
                    actual=len(value),
                    value=value,
                ),
                attr,
                self.length,
                value)

    def _lte(self, inst, attr, value):
        if not len(value) <= int(self.length.strip('<=')):
            raise TypeError(
                "length of '{name}' must be less than or equal to {length!r} (got {value!r} that is "
                "{actual!r}).".format(
                    name=attr.name,
                    length=self.length.strip('<='),
                    actual=len(value),
                    value=value,
                ),
                attr,
                self.length,
                value)

    def _eq(self, inst, attr, value):
        if not len(value) == int(self.length):
            raise TypeError(
                "length of '{name}' must be equal to {length!r} (got {value!r} that is "
                "{actual!r}).".format(
                    name=attr.name,
                    length=self.length,
                    actual=len(value),
                    value=value,
                ),
                attr,
                self.length,
                value)


    def __call__(self, inst, attr, value):
        """
        We use a callable class to be able to change the ``__repr__``.
        """
        if self.length.startswith('>'):
            return self._gt(inst, attr, value)

        elif self.length.startswith('<'):
            return self._gt(inst, attr, value)

        elif self.length.startswith('>='):
            return self._gte(inst, attr, value)

        elif self.length.startswith('<='):
            return self._gte(inst, attr, value)
        else:
            return self._gte(inst, attr, value)

    def __repr__(self):
        return "<instance_of validator for length {length!r}>".format(
            length=self.length)


def has_length(length):
    return _LengthValidator(length)


# this may not be useful - may be due to lack of understanding of attrs
# seems useful to me, and gets things moving for now
@attr.s(repr=False, slots=True, hash=True)
class _AllMembersValidator(object):
    members = attr.ib()

    def __call__(self, inst, attr, value):
        """
        We use a callable class to be able to change the ``__repr__``.
        """
        for member in value:
            if not self.members(member):
                raise MembersError(
                    "'{name}' member did not match `{members}` (got {value!r} that is a "
                    "{actual!r}).".format(
                        name=attr.name,
                        members=members,
                        actual=value.__class__,
                        value=value,
                    ),
                    attr,
                    self.members,
                    value)

    def __repr__(self):
        return "<instance_of validator for members {members!r}>".format(
            members=self.members
        )


def all_members(membertest):
    return _AllMembersValidator(membertest)
