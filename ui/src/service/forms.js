import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, CustomInput, Input} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';

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
        return ["Select a service type below, and give the service a name"];
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


export class BaseServiceConfigurationForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Add configuration for the service"];
    }

    onConfigChange = async (code) => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: code}));
    }

    async componentDidMount () {
        const {dispatch, form, service_types} = this.props;
        const {configuration, service_type} = form;
        if (configuration) {
            return;
        }
        const configDefault  = service_types[service_type]['labels']['envoy.playground.config.default'];
        if (configDefault) {
            const response = await fetch('http://localhost:8000/static/' + service_type + '/' + configDefault);
            const content = await response.text();
            await dispatch(updateForm({configuration: content}));
        }
    }

    onHighlight = (code) => {
        const {form, service_types} = this.props;
        const {service_type} = form;
        if (!service_type) {
            return code;
        }
        const configHighlight  = service_types[service_type]['labels']['envoy.playground.config.highlight'];
        if (!configHighlight) {
            return code;
        }
        return highlight(code, languages[configHighlight]);
    }

    render () {
        const {form} = this.props;
        const {configuration=''} = form;
        return (
            <div>
                <Editor
                  className="border bg-secondary"
                  value={configuration}
                  onValueChange={this.onConfigChange}
                  highlight={this.onHighlight}
                  padding={10}
                  name="configuration"
                  id="configuration"
                  ref={(textarea) => this.textArea = textarea}
                  style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                  }}
                />
            </div>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        service_types: state.service_type.value
    };
}

const ServiceConfigurationForm = connect(mapStateToProps)(BaseServiceConfigurationForm);
export {ServiceConfigurationForm};
