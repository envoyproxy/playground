import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {
    Button, Col, Input} from 'reactstrap';

import {updateForm} from '../../app/store';
import EdgeLogo from '../../app/images/edge.svg';
import EnvoyLogo from '../../app/images/envoy.svg';
import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundSelectInput} from '../../shared/forms';
import {PlaygroundFieldList} from '../../shared/forms/fields/list';


// VALIDATION REQUIRED
//  - port from:
//      - int in port range
//      - not a port obviously already taken - ie the site, api or any known existing listening ports
//  - port from
//      - int in port range


export class ProxyPortsListForm extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        port_mappings: PropTypes.array.isRequired,
    });

    get headers () {
        return [
            [4, (
                <span>
                  <img
                    alt="external"
                    src={EdgeLogo}
                    width="24px"
                    className="ml-1 mr-2"  />
                  External ports
                </span>
            )],
            [3, (
                <span>
                  <img
                    alt="envoy"
                    src={EnvoyLogo}
                    width="24px"
                    className="ml-1 mr-2"  />
                  Internal port
                </span>
            )],
            [4, <span>Endpoint type</span>]];
    };

    row = (name) => {
        const {port_mappings=[]} = this.props;
        const mappings = Object.fromEntries(
            port_mappings.map(m => [m.mapping_from, m]));
        return [
            <div>{name}</div>,
            <div>{mappings[name].mapping_to}</div>,
            <div>{mappings[name].mapping_type ? mappings[name].mapping_type.toUpperCase() : 'Generic TCP'}</div>];
    };

    render () {
        const {onDelete, port_mappings=[]} = this.props;
        return (
            <PlaygroundFieldList
              headers={this.headers}
              onDelete={onDelete}
              row={this.row}
              keys={port_mappings.map(m => m.mapping_from)}
            />);
    }
}


export class BaseProxyPortsForm extends React.Component {
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
                    <PlaygroundSelectInput
                      onChange={this.onChange}
                      value={mapping_type}
                      name="mapping_type"
                      placeholder="Generic TCP (default)"
                      options={[['http', 'HTTP'], ['https', 'HTTPS']]} />
                  </Col>
                  <Col sm={2}>
                    <Button
                      color="success"
                      onClick={this.onClick}>+</Button>
                  </Col>
                </PlaygroundFormGroupRow>
                <ProxyPortsListForm
		  onDelete={this.onDelete}
		  port_mappings={[...port_mappings]} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapModalStateToProps = function(state) {
    return {
        form: state.form.value,
    };
};


const ProxyPortsForm = connect(mapModalStateToProps)(BaseProxyPortsForm);
export {ProxyPortsForm};
