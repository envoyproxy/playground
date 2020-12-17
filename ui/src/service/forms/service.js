import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow,
    PlaygroundNameInput,
    PlaygroundSelectInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


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

    onTypeChange = async (evt) => {
        const {dispatch, form} = this.props;
        let {errors={}, service_type} = form;
        let valid = true;
        service_type = evt.target.value;
        if (!service_type || errors.name) {
            valid = false;
        }
        await dispatch(updateForm({valid, service_type}));
    }

    onNameChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {name, errors} = evt;
        let {valid} = evt;
        const {service_type} = form;
        if (!service_type) {
            valid = false;
        }
        await dispatch(updateForm({errors, valid, name, service_type}));
    }

    render () {
        const {form, services, service_types, meta} = this.props;
        const {service_type='', name='', errors={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="name"
                  title="Name">
                  <Col sm={9}>
		    <PlaygroundNameInput
                      placeholder="Enter service name"
                      errors={errors}
                      value={name}
                      meta={meta}
                      taken={Object.keys(services)}
                      onChange={this.onNameChange} />
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="service_type"
                  title="Service type">
                  <Col sm={9}>
                    <PlaygroundSelectInput
                      name="service_type"
                      value={service_type}
                      onChange={this.onTypeChange}
                      placeholder="Select a service type"
                      options={Object.entries(service_types).map(([k, v])  => [k, v.title])}
                    />
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapFormStateToProps = function(state) {
    return {
        form: state.form.value,
        services: state.service.value,
        service_types: state.service_type.value,
        meta: state.meta.value,
    };
};

export default connect(mapFormStateToProps)(BaseServiceForm);
