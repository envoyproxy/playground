import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col, Label, Input, Row} from 'reactstrap';

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
        const {dispatch} = this.props;
        dispatch(updateForm({name: evt.currentTarget.value}));
    }

    render () {
        const {form} = this.props;
        const {name, validation} = form;
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
                      onChange={this.onChange}
                    />
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
