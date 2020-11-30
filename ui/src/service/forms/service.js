import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, CustomInput} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


// VALIDATION REQUIRED
//  - service_type
//      - is set


class BaseServiceForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Select a service type below, and give the service a name"];
    }

    onChange = async (evt) => {
        const {dispatch, form, services, meta} = this.props;
        const {max_name_length, min_name_length} = meta;
        let {service_type, name=''} = form;
        let valid = true;
        const errors = {name: []};

        if (evt.target.name === 'service_type') {
            service_type = evt.target.value;
        } else {
            name = evt.currentTarget.value.toLowerCase();
        }

        if (!service_type) {
            valid = false;
        }

        if (name.length < parseInt(min_name_length)) {
            valid = false;
        }
        if (name.length > parseInt(max_name_length)) {
            valid = false;
            errors.name.push('Network name too long, maximum ' + max_name_length + ' chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (name.indexOf(forbidden) !== -1) {
                valid = false;
                errors.name.push('Network name cannot contain \'' + forbidden + '\'');
            }
        }
        if (name.length > 0 && !name.match(/[a-z]+[a-z0-9.\-_]*$/)) {
            valid = false;
            errors.name.push('Network name contains forbidden characters');
        }
        if (Object.keys(services).indexOf(name) !== -1) {
            valid = false;
            errors.name.push('Network name exists already');
        }

        if (valid) {
            delete errors.name;
        }
        await dispatch(updateForm({errors, valid, name, service_type}));
    }

    render () {
        const {form, service_types} = this.props;
        const {service_type={}, name, errors={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="name"
                  title="Name">
                  <Col sm={9}>
		    <PlaygroundInput
                      name="name"
                      placeholder="Enter service name"
                      errors={errors}
                      value={name || ''}
                      onChange={this.onChange} />
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="service_type"
                  title="Service type">
                  <Col sm={9}>
                    <CustomInput
                      type="select"
                      id="service_type"
                      name="service_type"
                      value={service_type}
                      onChange={this.onChange}>
                      <option value="">Select a service type</option>
                      {Object.entries(service_types).map(([k, v], index) => {
                          return (
                              <option value={k} key={index}>{v.title}</option>);
                      })}
                    </CustomInput>
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapFormStateToProps = function(state) {
    return {
        service_types: state.service_type.value,
        form: state.form.value,
        services: state.proxy.value,
        meta: state.meta.value,
    };
};

const ServiceForm = connect(mapFormStateToProps)(BaseServiceForm);
export {ServiceForm};
