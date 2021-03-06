
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Button, Col, Input} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../shared/forms';
import {updateForm} from '../../app/store';
import {PlaygroundFieldList} from '../../shared/forms/fields/list';


// VALIDATION REQUIRED
//  - env key
//      - valid chars not too long/short
//  - env value
//      - not too long


export class ServiceEnvironmentFieldList extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        vars: PropTypes.object,
    });

    get headers () {
        return [
            [5, <div>Variable name</div>],
            [6, <div>Variable value</div>]];
    };

    row = (name) => {
        const {vars={}} = this.props;
        const value = vars[name] + '';
        let className = 'p-1 ';
        if (['true', 'false'].indexOf(value) !== -1) {
            className += 'text-primary';
        } else {
            className += 'text-muted';
        }
        return [
            <div className="p-1 pl-2">{name}</div>,
            <div className={className}>{value}</div>];
    };

    render () {
        const {onDelete, vars={}} = this.props;
        return (
            <PlaygroundFieldList
              headers={this.headers}
              onDelete={onDelete}
              row={this.row}
              keys={Object.keys(vars)}
            />);
    }
}


export class BaseServiceEnvironmentForm extends React.Component {
    static propTypes = exact({
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        dispatch: PropTypes.func,
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
            "Edit the environment variables for this service.",
            "Check the README for more information about significant environment variables for this service type.",
        ];
    }

    async componentDidUpdate(prevProps) {
        const {dispatch, form, service_types} = this.props;
        const {service_type} = form;
        if (service_type !== prevProps.form.service_type) {
            if (service_type && service_type !== undefined) {
                const {environment: vars} =  service_types[service_type];
                await dispatch(updateForm({vars}));
            } else {
                await dispatch(updateForm({vars: {}}));
            }
        }
    }

    async componentDidMount () {
        const {dispatch, form, service_types} = this.props;
        const {service_type} = form;
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
                <ServiceEnvironmentFieldList
                  onDelete={this.onDelete}
                  vars={{...vars}} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


export const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        service_types: state.service_type.value,
    };
};

export default connect(mapStateToProps)(BaseServiceEnvironmentForm);
