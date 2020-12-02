
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundInput} from '..';


export class PlaygroundNameInput extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        taken: PropTypes.array.isRequired,
        meta: PropTypes.object.isRequired,
        errors: PropTypes.object.isRequired,
        placeholder: PropTypes.string.isRequired,
        value: PropTypes.string,
    });

    onChange = async (evt) => {
        const {taken, onChange, meta} = this.props;
        const {max_name_length, min_name_length} = meta;
        const name = evt.target.value.toLowerCase();
        let valid = true;
        const _errors = [];

        if (name.length < parseInt(min_name_length)) {
            valid = false;
        }
        if (name.length > parseInt(max_name_length)) {
            valid = false;
            _errors.push('Name too long, maximum ' + max_name_length + ' chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (name.indexOf(forbidden) !== -1) {
                valid = false;
                _errors.push('Name cannot contain \'' + forbidden + '\'');
            }
        }
        if (name.length > 0 && !name.match(/[a-z]+[a-z0-9.\-_]*$/)) {
            valid = false;
            _errors.push('Name contains forbidden characters');
        }
        if (taken.indexOf(name) !== -1) {
            valid = false;
            _errors.push('Name exists already');
        }
        const errors = {};
        if (_errors.length > 0) {
            errors.name = _errors;
        }
        await onChange({errors, valid, name});
    }

    render () {
        const {errors, placeholder, value=''} = this.props;
        return (
	    <PlaygroundInput
              name="name"
              placeholder={placeholder}
              errors={errors}
              value={value}
              onChange={this.onChange} />);
    }
}
