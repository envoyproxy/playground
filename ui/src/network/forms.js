import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Alert, Col, Label, Input, Row} from 'reactstrap';

import {PlaygroundForm, PlaygroundFormGroup} from '../shared/forms';
import {updateForm} from '../app/store';


// VALIDATION REQUIRED
//  - config:
//      - not too long
//  - name
//      - is set
//      - valid chars, not too long/short
//      - unique


export class BaseNetworkProxiesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    get messages () {
        return ["Add and remove proxies from this network"];
    }

    onChange = (evt) => {
        const {dispatch, form, networks, onUpdate} = this.props;
        const {edit, proxies=[], ...data} = form;
        const {name} =  data;
        let _proxies;
        if (edit) {
            _proxies = [...networks[name].proxies];
        } else {
            _proxies = [...proxies];
        }
        if (evt.currentTarget.checked) {
            _proxies.push(evt.currentTarget.name);
        } else {
            _proxies = _proxies.filter(i => i !== evt.currentTarget.name);
        }
        if (edit) {
            onUpdate({...data, proxies: _proxies});
        } else {
            dispatch(updateForm({proxies: _proxies}));
        }
    };

    render () {
        const  {form, proxies, networks} = this.props;
        const {edit, name} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
              <PlaygroundFormGroup check>
                {Object.entries(proxies).map(([k, v], i) => {
                    let checked  = (form.proxies || []).indexOf(k) !== -1;
                    if (edit) {
                        checked = (networks[name].proxies || []).indexOf(k) !== -1;
                    }
                    return (
                        <Row className="p-1 pl-3 ml-2">
                          <Col sm={10} >
                            <Label key={i} check>
                              <Input
                                type="checkbox"
                                name={k}
                                onChange={this.onChange}
                                checked={checked} />
                              <div className="ml-1">
                                {k}
                              </div>
                            </Label>
                          </Col>
                        </Row>);
                })}
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapNetworkStateToProps = function(state, other) {
    return {
        networks: state.network.value,
        proxies: state.proxy.value,
        form: state.form.value,
    };
}

const NetworkProxiesForm = connect(mapNetworkStateToProps)(BaseNetworkProxiesForm);
export {NetworkProxiesForm};


export class BaseNetworkServicesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    get messages () {
        return ["Add and remove services from this network"];
    }

    onChange = (evt) => {
        const {dispatch, form, networks, onUpdate} = this.props;
        const {edit, services=[], ...data} = form;
        const {name} =  data;
        let _services;
        if (edit) {
            _services = [...networks[name].services];
        } else {
            _services = [...services];
        }
        if (evt.currentTarget.checked) {
            _services.push(evt.currentTarget.name);
        } else {
            _services = _services.filter(i => i !== evt.currentTarget.name);
        }
        if (edit) {
            onUpdate({...data, services: _services});
        } else {
            dispatch(updateForm({services: _services}));
        }
    };

    render () {
        const  {form, networks, services} = this.props;
        const {edit, name} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
              <PlaygroundFormGroup check>
                {Object.entries(services).map(([k, v], i) => {
                    let checked  = (form.services || []).indexOf(k) !== -1;
                    if (edit) {
                        checked = (networks[name].services || []).indexOf(k) !== -1;
                    }
                    return (
                        <Row className="p-1 pl-3 ml-2" key={i}>
                          <Col sm={10} >
                            <Label key={i} check>
                              <Input
                                type="checkbox"
                                name={k}
                                onChange={this.onChange}
                                checked={checked} />
                              <div className="ml-1">
                                {k}
                              </div>
                            </Label>
                          </Col>
                        </Row>);
                })}
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const mapNetworkServicesStateToProps = function(state, other) {
    return {
        networks: state.network.value,
        services: state.service.value,
        form: state.form.value,
    };
}

const NetworkServicesForm = connect(mapNetworkServicesStateToProps)(BaseNetworkServicesForm);
export {NetworkServicesForm};


class BaseNetworkForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Add a named network. You can add proxies and services to the network."];
    }

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        let valid = true;
        const errors = {name: []};
        if (evt.currentTarget.value.length < 3) {
            valid = false;
        }
        if (evt.currentTarget.value.length > 32) {
            valid = false;
            errors.name.push('Network name too long, maximum 32 chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (evt.currentTarget.value.indexOf(forbidden) !== -1) {
                valid = false;
                errors.name.push('Network name cannot contain \'' + forbidden + '\'');
            }
        }
        if (valid) {
            delete errors.name;
        }
        dispatch(updateForm({errors,valid, name: evt.currentTarget.value.toLowerCase()}));
    }

    render () {
        const {form} = this.props;
        const {edit, errors={}, name, validation} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
              <PlaygroundFormGroup>
                <Row>
                  <Label sm={3}  for="name" className="text-right">
                    <div>
                      Name
                    </div>
                  </Label>
                  <Col sm={9}>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={name || ''}
                      placeholder="Enter network name"
                      disabled={edit}
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
                </Row>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const NetworkForm = connect(mapStateToProps)(BaseNetworkForm);
export {NetworkForm};
