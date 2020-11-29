import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col, Label, Input, Row} from 'reactstrap';

import {PlaygroundForm, PlaygroundFormGroup} from '../../shared/forms';
import {updateForm} from '../../app/store';


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

    onChange = async (evt) => {
        const {dispatch, form, networks, onUpdate} = this.props;
        const {edit, services=[], ...data} = form;
        const {name} =  data;
        let _services;
        if (edit) {
            _services = [...(networks[name].services || [])];
        } else {
            _services = [...services];
        }
        if (evt.currentTarget.checked) {
            _services.push(evt.currentTarget.name);
        } else {
            _services = _services.filter(i => i !== evt.currentTarget.name);
        }
        if (edit) {
            await dispatch(updateForm({services: _services}));
            await onUpdate({...data, services: _services});
        } else {
            await dispatch(updateForm({services: _services}));
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
