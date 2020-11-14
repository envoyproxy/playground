import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, CustomInput, Input} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../shared/forms';

import {updateForm} from '../app/store';


class BaseServiceForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Information about adding service"];
    }

    onChange = async (evt) => {
        const {dispatch} = this.props;
        const update = {};
        update[evt.target.name] = evt.target.value;
        dispatch(updateForm(update));
    }

    render () {
        const {form, service_types} = this.props;
        const {service_type={}, name} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="name"
                  title="Name">
                  <Col sm={9}>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={name || ""}
                      placeholder="Enter service name"
                      onChange={this.onChange}
                    />
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
                      <option>Select a service type</option>
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
    };
};

const ServiceForm = connect(mapFormStateToProps)(BaseServiceForm);
export {ServiceForm};
