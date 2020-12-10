import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, CustomInput} from 'reactstrap';

import {updateForm} from '../../app/store';
import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundNameInput} from '../../shared/forms';
import {ProxyConfigForm} from './config';

import Yaml from 'js-yaml';

import {ProxyVersionField} from './version';


export class BaseProxyForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        examples: PropTypes.object.isRequired,
    });

    get messages () {
        return [
            "Enter a unique proxy name, and add configuration below.",
            "The proxy will be addressable on any networks it connects to with the proxy name."
        ];
    }

    validateConfiguration = (config, errors) => {
        errors = errors || {};
        errors.configuration = [];
        let valid = true;
        if (config.length < parseInt(20)) {
            valid = false;
        }
        if (config.length > 0) {
            try {
                Yaml.safeLoad(config);
            }
            catch (error) {
                valid = false;
                errors.configuration.push(error.message);
            }
        }
        if (valid) {
            delete errors.configuration;
        }
        return valid;
    };

    onNameChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {name, errors} = evt;
        let {valid} = evt;
        const {configuration=''} = form;
        let warning;
        if (!this.validateConfiguration(configuration)) {
            valid = false;
            warning = "Don't forget to add Envoy configuration";
        }
        await dispatch(updateForm({errors, valid, name, warning}));
    }

    onConfigChange = async (configuration) => {
        // TODO: validate yaml config as yaml, and length.
        const {form,  dispatch} = this.props;
        const {errors: _errors={}} = form;
        let {valid} = form;
        const errors = {..._errors};
        if (!this.validateConfiguration(configuration, errors)) {
            valid = false;
        } else if (!errors.name) {
            valid = true;
        }
        await dispatch(
            updateForm({
                errors,
                valid,
                configuration,
                warning: null}));
    }

    render () {
        const {dispatch, examples, form, meta, proxies} = this.props;
        const {configuration, name='', errors={}} = form;
        const {min_name_length} = meta;
        let showConfig = true;
        if (name.length < min_name_length) {
            showConfig = false;
        }
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  title="Name*"
                  label="name">
                  <Col sm={4}>
	            <PlaygroundNameInput
                      placeholder="Enter proxy name"
                      errors={errors}
                      value={name}
                      meta={meta}
                      taken={Object.keys(proxies)}
                      onChange={this.onNameChange} />
                  </Col>
                  <Col sm={3}>
                    <ProxyVersionField
                      dispatch={dispatch}
                      form={form}
                    />
                  </Col>
                  <Col sm={1}>
                    &nbsp;
                  </Col>
                </PlaygroundFormGroupRow>
                <PlaygroundFormGroupRow
                  title=""
                  label="">
                  <Col sm={5}>
                    <CustomInput
                      type="checkbox"
                      id="exampleCustomCheckbox"
                      label="Pull newest container image." />
                  </Col>
                  <Col sm={3}>
                  </Col>
                </PlaygroundFormGroupRow>
                {showConfig &&
                 <ProxyConfigForm
                   configuration={configuration}
                   errors={errors}
                   examples={examples}
                   dispatch={dispatch}
                   onChange={this.onConfigChange}
                 />
                }
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        proxies: state.proxy.value,
        meta: state.meta.value,
        examples: state.example.value,
    };
}

const ProxyForm = connect(mapStateToProps)(BaseProxyForm);
export {ProxyForm};
