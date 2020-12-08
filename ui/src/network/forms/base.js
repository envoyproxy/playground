import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Label, Input, Row} from 'reactstrap';

import {PlaygroundForm, PlaygroundFormGroup} from '../../shared/forms';
import {updateForm} from '../../app/store';


export class NetworkConnectionsForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        connections: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form, networks, onUpdate, type} = this.props;
        const {edit, ...data} = form;
        const {name} =  data;
        const connections = form[type];
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
            await dispatch(updateForm(update));
            await onUpdate({...data, ...update});
        } else {
            await dispatch(updateForm(update));
        }
    };

    render () {
        const  {form, connections, networks, type} = this.props;
        const {edit, name} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
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
