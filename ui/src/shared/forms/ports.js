import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Button, Col, CustomInput, Input, Row } from 'reactstrap';

import {updateForm} from '../../app/store';
import EdgeLogo from '../../images/edge.svg';
import EnvoyLogo from '../../images/envoy.svg';
import {ActionRemove} from '../actions';
import {PlaygroundForm, PlaygroundFormGroup, PlaygroundFormGroupRow} from './base';

// VALIDATION REQUIRED
//  - port from:
//      - int in port range
//      - not a port obviously already taken - ie the site, api or any known existing listening ports
//  - port from
//      - int in port range

export class PortMappingListForm extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        port_mappings: PropTypes.array,
    });

    render () {
        const {onDelete, port_mappings=[]} = this.props;
        const title = '';

        if (port_mappings.length === 0) {
            return '';
        }
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <Row className="pl-5 pr-5">
                  <Col sm={1} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <span>&nbsp;</span>
                    </div>
                  </Col>
                  <Col sm={4} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <img
                        alt={title}
                        src={EdgeLogo}
                        width="24px"
                        className="ml-1 mr-2"  />
                      External port
                    </div>
                  </Col>
                  <Col sm={3} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <img
                        alt={title}
                        src={EnvoyLogo}
                        width="24px"
                        className="ml-1 mr-2"  />
                      Internal port
                    </div>
                  </Col>
                  <Col sm={4} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Endpoint type
                    </div>
                  </Col>
                </Row>
                {port_mappings.map((mapping, index) => {
                    const {mapping_from, mapping_to, mapping_type} = mapping;
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              <ActionRemove
                                title={mapping_from}
                                name={mapping_from}
                                remove={e => onDelete(mapping_from)} />
                            </div>
                          </Col>
                          <Col sm={4} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {mapping_from}
                            </div>
                          </Col>
                          <Col sm={3} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {mapping_to}
                            </div>
                          </Col>
                          <Col sm={4} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {((mapping_type && mapping_type.toUpperCase()) || 'Generic TCP')}
                            </div>
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BasePortMappingForm extends React.Component {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    state = {
        mapping_from: undefined,
        mapping_to: undefined,
        mapping_type: undefined};

    onClick = async (evt) => {
        const {mapping_from=10000, mapping_to=10000, mapping_type} = this.state;
        const {dispatch, form} = this.props;
        const {port_mappings=[]} = form;
        const newMappings = [...port_mappings, {mapping_from, mapping_to, mapping_type}];
        this.setState({mapping_from: undefined, mapping_to: undefined, mapping_type: undefined});
        // TODO: add validation against existing ports
        await dispatch(updateForm({port_mappings: newMappings}));
    }

    onChange = (evt) => {
        const {name, value} = evt.target;
        const state = {};
        state[name] = value;
        this.setState(state);
    }

    get messages () {
        return [
            "Expose ports from your container to localhost.",
            "Type hint is used to create links only."
        ];
    }

    onDelete = async (item) => {
        const {dispatch, form} = this.props;
        const {port_mappings=[]} = form;
        await dispatch(updateForm({port_mappings: port_mappings.filter(v => v.mapping_from !== item)}));
    }

    render () {
        const {mapping_from, mapping_to, mapping_type} = this.state;
        const {form} = this.props;
        const {port_mappings=[]} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="ports"
                  title="Port mapping">
                  <Col sm={2}>
                    <Input
                      type="number"
                      onChange={this.onChange}
                      id="mapping_from"
                      name="mapping_from"
                      value={mapping_from || 10000}
                      placeholder="10000" />
                  </Col>
                  <Col sm={2}>
                    <Input
                      type="number"
                      onChange={this.onChange}
                      id="mapping_to"
                      name="mapping_to"
                      value={mapping_to || 10000}
                      placeholder="10000" />
                  </Col>
                  <Col sm={3}>
                    <CustomInput
                      type="select"
                      id="mapping_type"
                      onChange={this.onChange}
                      value={mapping_type}
                      name="mapping_type">
                      <option>Generic TCP (default)</option>
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                    </CustomInput>
                  </Col>
                  <Col sm={2}>
                    <Button
                      color="success"
                      onClick={this.onClick}>+</Button>
                  </Col>
                </PlaygroundFormGroupRow>
                <PortMappingListForm
		  onDelete={this.onDelete}
		  port_mappings={[...port_mappings]} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}
