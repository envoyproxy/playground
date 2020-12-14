
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, CustomInput, Input} from 'reactstrap';


export class PlaygroundInput extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        type: PropTypes.string,
        id: PropTypes.string,
        errors: PropTypes.object,
    };

    render () {
        const {
            errors,
            id, name, type='text', ...props} = this.props;
        return (
            <>
              <Input
                {...props}
                id={id || name}
                type={type}
                name={name}
              />
              {(errors.name || []).map((e, i) => {
                  return (
                      <Alert
                        className="p-1 mt-2 mb-2"
                        color="danger"
                        key={i}>{e}</Alert>
                  );
              })}
            </>);
    }
}


export class PlaygroundSelectInput extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
        placeholder: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,

        value: PropTypes.string,
    });

    render () {
        const {
            value, name, placeholder,
            onChange, options} = this.props;
        return (
            <CustomInput
              type="select"
              id={name}
              name={name}
              value={value}
              onChange={onChange}>
              <option value="">{placeholder}</option>
              {options.map(([k, v], index) => {
                  return (
                      <option value={k} key={index}>{v}</option>);
              })}
            </CustomInput>
        );
    }

}


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
              name="envoy.playground.name"
              autoFocus
              placeholder={placeholder}
              errors={errors}
              value={value}
              onChange={this.onChange} />);
    }
}
