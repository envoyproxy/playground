import attr


@attr.s(repr=False, slots=True, hash=True)
class _LengthValidator(object):
    length = attr.ib()

    def __call__(self, inst, attr, value):
        """
        We use a callable class to be able to change the ``__repr__``.
        """
        if self.length.startswith('>'):
            if not len(value) > int(self.length.strip('>')):
                raise TypeError(
                    "'{name}' must be longer than {length!r} (got {value!r} that is a "
                    "{actual!r}).".format(
                        name=attr.name,
                        length=self.length.strip('>'),
                        actual=value.__class__,
                        value=value,
                    ),
                    attr,
                    self.length,
                    value)

        if self.length.startswith('<'):
            if not len(value) < int(self.length.strip('<')):
                raise TypeError(
                    "length of '{name}' must be less than {length!r} (got {value!r} that is a "
                    "{actual!r}).".format(
                        name=attr.name,
                        length=self.length.strip('<'),
                        actual=len(value),
                        value=value,
                    ),
                    attr,
                    self.length,
                    value)

    def __repr__(self):
        return "<instance_of validator for length {length!r}>".format(
            length=self.length
        )


def has_length(length):
    return _LengthValidator(length)


@attr.s(repr=False, slots=True, hash=True)
class _MembersValidator(object):
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


def has_members(members):
    return _MembersValidator(members)
