
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, CustomInput, Input} from 'reactstrap';

import {PlaygroundContext} from '../../../app';


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
    static contextType = PlaygroundContext;
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        errors: PropTypes.object.isRequired,
        placeholder: PropTypes.string.isRequired,
        taken: PropTypes.array.isRequired,

        value: PropTypes.string,
    });

    onChange = async (evt) => {
        const {name: validator} = this.context.validators;
        const {onChange, taken} = this.props;
        const name = evt.target.value.toLowerCase();
        const {valid, errors} = validator(name, taken);
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
