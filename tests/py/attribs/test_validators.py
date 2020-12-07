
import pytest

from playground.control.attribs.validators import _LengthValidator


class DummyException(Exception):
    pass


LEN_VALID_PARAMS = (
    (23, 25, 'eq'),
    (33, 17, 'eq'),
    (23, 23, ''),
    (33, 33, ''),

    ('>33', 33, 'gt'),
    ('>33', 23, 'gt'),
    ('>33', 17, 'gt'),
    ('>33', 34, ''),
    ('>33', 1234, ''),

    ('>=33', 33, ''),
    ('>=33', 23, 'gte'),
    ('>=33', 17, 'gte'),
    ('>=33', 34, ''),
    ('>=33', 1234, ''),

    ('<33', 33, 'lt'),
    ('<33', 123, 'lt'),
    ('<33', 117, 'lt'),
    ('<33', 32, ''),
    ('<33', 2, ''),

    ('<=33', 33, ''),
    ('<=33', 123, 'lte'),
    ('<=33', 117, 'lte'),
    ('<=33', 32, ''),
    ('<=33', 2, ''))


@pytest.mark.parametrize("valid,testlen,error", LEN_VALID_PARAMS)
def test_validator_length(patch_playground, valid, testlen, error):
    _patch_error = patch_playground(
        'attribs.validators._LengthValidator._type_error')

    def _validate(validator, m_error, thing):
        if not error:
            validator('INST', 'ATTR', thing * testlen)
            assert not m_error.called
        else:
            with pytest.raises(DummyException):
                validator('INST', 'ATTR', thing * testlen)

            msg = getattr(validator, f'_err_{error}')
            _valid = (
                str(valid).strip('><=')
                if not isinstance(valid, int)
                else valid)
            assert (
                list(m_error.call_args)
                == [(msg, 'ATTR', thing * testlen,
                     _valid), {}])

    with _patch_error as m_error:
        m_error.return_value = DummyException
        validator = _LengthValidator(valid)
        _validate(validator, m_error, [''])
        _validate(validator, m_error, ('', ))
        _validate(validator, m_error, 'X')
