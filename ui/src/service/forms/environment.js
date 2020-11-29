import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Button, Col, Input, Row} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../shared/forms';

import {updateForm} from '../../app/store';

import {ActionRemove} from '../../shared/actions';


// VALIDATION REQUIRED
//  - env key
//      - valid chars not too long/short
//  - env value
//      - not too long


export class ServiceEnvironmentListForm extends React.PureComponent {
    static propTypes = exact({
        vars: PropTypes.object,
        onDelete: PropTypes.func.isRequired,
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
                    if (v === null || v === undefined || v.length === 0) {
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
        service_type: PropTypes.string.isRequired,
        service_types: PropTypes.object.isRequired,
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
