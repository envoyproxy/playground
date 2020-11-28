import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Alert, Button, Col, CustomInput, Input, Row} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../shared/forms';

import {updateForm} from '../app/store';

import {ActionRemove} from '../shared/actions';


// VALIDATION REQUIRED
//  - config:
//      - not too long
//  - service_type
//      - is set
//  - env key
//      - valid chars not too long/short
//  - env value
//      - not too long

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
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={name || ""}
                      placeholder="Enter service name"
                      onChange={this.onChange}
                    />
                    {(errors.name || []).map((e, i) => {
                        return (
                            <Alert
                              className="p-1 mt-2 mb-2"
                              color="danger"
                              key={i}>{e}</Alert>
                        );
                    })}
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


export class ServiceEnvironmentListForm extends React.PureComponent {
    static propTypes = exact({
        vars: PropTypes.array,
    });

    render () {
        const {onDelete, vars={}} = this.props;
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <Row className="pl-5 pr-5">
                  <Col sm={1} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <span>&nbsp;</span>
                    </div>
                  </Col>
                  <Col sm={6} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Variable name
                    </div>
                  </Col>
                  <Col sm={5} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Variable value
                    </div>
                  </Col>
                </Row>
                {Object.entries(vars).map(([k, v], index) => {
                    let value = v;
                    if (!v || v.length === 0) {
                        value = <span>&nbsp;</span>;
                    }
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white">
                              <ActionRemove
                                title={k}
                                name={k}
                                remove={e => onDelete(k)} />
                            </div>
                          </Col>
                          <Col sm={6} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {k}
                            </div>
                          </Col>
                          <Col sm={5} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {value}
                            </div>
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BaseServiceEnvironmentForm extends React.Component {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    state = {value: '', key: ''};

    onClick = async (evt) => {
        const {value, key} = this.state;
        const {dispatch, form} = this.props;
        const {vars: _vars={}} = form;
        const vars = {..._vars};
        vars[key] = value;
        this.setState({value: '', key: ''});
        await dispatch(updateForm({vars}));
    }

    onChange = (evt) => {
        const update = {};
        update[evt.target.name] = evt.target.value;
        this.setState({...update});
    }

    onDelete = async (name) => {
        const {dispatch, form} = this.props;
        const {vars: _vars={}} = form;
        const vars = {..._vars};
        delete vars[name];
        await dispatch(updateForm({vars}));
    }

    get messages () {
        return [
            "Add network vars for your proxy.",
            "Your proxy will be addressable by other proxies or services with this value",
            "You can restrict which networks an value is used for with a glob match, default is *",
        ];
    }

    async componentDidUpdate(prevProps) {
        const {dispatch, service_type, service_types} = this.props;
        if (service_type !== prevProps.service_type) {
            if (service_type && service_type !== undefined) {
                const {environment: vars} =  service_types[service_type];
                await dispatch(updateForm({vars}));
            } else {
                await dispatch(updateForm({vars: {}}));
            }
        }
    }

    async componentDidMount () {
        const {dispatch, service_type, service_types} = this.props;
        if (service_type && service_type !== undefined) {
            const {environment: vars} =  service_types[service_type];
            await dispatch(updateForm({vars}));
        } else {
            await dispatch(updateForm({vars: {}}));
        }
    }

    render () {
        const {value, key} = this.state;
        const {form} = this.props;
        const {vars={}} = form;
        let disabled = true;
        if (key && key.trim().length > 0 && key.indexOf(' ') === -1) {
            disabled = false;
        }

        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="value"
                  title="Add value">
                  <Col sm={3}>
                    <Input
                      type="text"
                      onChange={this.onChange}
                      value={key}
                      id="key"
                      name="key"
                      placeholder="Variable name" />
                  </Col>
                  <Col sm={4}>
                    <Input
                      type="text"
                      onChange={this.onChange}
                      value={value}
                      id="value"
                      name="value"
                      placeholder="Variable value" />
                  </Col>
                  <Col sm={2}>
                    <Button
                      color="success"
                      disabled={disabled}
                      onClick={this.onClick}>+</Button>
                  </Col>
                </PlaygroundFormGroupRow>
                <ServiceEnvironmentListForm
                  onDelete={this.onDelete}
                  vars={{...vars}} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapEnvFormStateToProps = function(state) {
    return {
        form: state.form.value,
        service_types: state.service_type.value,
    };
}


const ServiceEnvironmentForm = connect(mapEnvFormStateToProps)(BaseServiceEnvironmentForm);
export {ServiceEnvironmentForm}
