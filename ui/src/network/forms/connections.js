import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, Label, Input, Row} from 'reactstrap';

import {PlaygroundForm, PlaygroundFormGroup} from '../../shared/forms';
import {PlaygroundContext} from '../../app';
import {updateForm} from '../../app/store';


export class BaseNetworkConnectionsForm extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        type: PropTypes.string.isRequired,
        messages: PropTypes.array.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form, networks, type} = this.props;
        const {edit, ...data} = form;
        const {name} =  data;
        const connections = form[type] || [];
        let _connections;
        if (edit) {
            _connections = [...(networks[name][type] || [])];
        } else {
            _connections = [...connections];
        }
        if (evt.currentTarget.checked) {
            _connections.push(evt.currentTarget.name);
        } else {
            _connections = _connections.filter(i => i !== evt.currentTarget.name);
        }
        const update = {};
        update[type] = _connections;
        if (edit) {
            const {api} = this.context;
            await dispatch(updateForm(update));
            await api.network.update({...data, ...update});
        } else {
            await dispatch(updateForm(update));
        }
    };

    render () {
        const  {form, messages, networks, type} = this.props;
        const {edit, name} = form;
        const connections = this.props[type];
        return (
            <PlaygroundForm
              messages={messages}>
              <PlaygroundFormGroup check>
                {Object.entries(connections).map(([k, v], i) => {
                    let checked  = (form[type] || []).indexOf(k) !== -1;
                    if (edit) {
                        checked = (networks[name][type] || []).indexOf(k) !== -1;
                    }
                    return (
                        <Row className="p-1 pl-3 ml-2" key={i}>
                          <Col sm={10} >
                            <Label check>
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
        services: state.service.value,
        form: state.form.value,
    };
}

const NetworkConnectionsForm = connect(mapNetworkStateToProps)(BaseNetworkConnectionsForm);
export {NetworkConnectionsForm};
