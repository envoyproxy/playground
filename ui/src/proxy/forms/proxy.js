import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col} from 'reactstrap';

import {updateForm} from '../../app/store';
import {PlaygroundEditor} from '../../shared/editor';
import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundNameInput} from '../../shared/forms';

import Yaml from 'js-yaml';


const code =
`static_resources:
  clusters:
    ...
  listeners:
    ...
`;

// VALIDATION REQUIRED
//  - code:
//      - is set
//      - valid yaml
//      - not too long, and not too short
//      - ideally valid envoy config


export class ProxyConfigForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        configuration: PropTypes.string.isRequired,
        errors: PropTypes.object.isRequired,
        examples: PropTypes.object.isRequired,
    });

    clearConfig = () => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: ''}));
    }

    onExampleSelect = async (evt) => {
        const {dispatch, errors: _errors, examples} = this.props;
        const {envoy} = examples;
        const errors = {..._errors};
        // todo: implement overwrite button
        // if (configuration !== code)
        if (envoy[evt.target.value]) {
            const response = await fetch(envoy[evt.target.value]);
            const text = await response.text();
            delete errors.configuration;
            await dispatch(updateForm({configuration: text, valid: true, errors}));
        } else {
            await dispatch(updateForm({configuration: code, valid: false}));
        }
    }

    render ()  {
        const {configuration, examples, errors, onChange} = this.props;
        const {envoy} = examples;
        const {configuration: configErrors=[]} =  errors;
        return (
            <PlaygroundFormGroup>
              <PlaygroundEditor
                title="Configuration*"
                name="configuration"
                content={configuration}
                format="yaml"
                examples={Object.keys(envoy)}
                clearConfig={this.clearConfig}
                onChange={onChange}
                onExampleSelect={this.onExampleSelect}
                errors={configErrors}
              />
            </PlaygroundFormGroup>);
    }
}

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
        if (!this.validateConfiguration(configuration)) {
            valid = false;
        }
        await dispatch(updateForm({errors, valid, name}));
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
        await dispatch(updateForm({errors, valid, configuration}));
    }

    render () {
        const {dispatch, examples, form, meta, proxies} = this.props;
        const {configuration=code, name='', errors={}} = form;
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
                  <Col sm={8}>
	            <PlaygroundNameInput
                      placeholder="Enter proxy name"
                      errors={errors}
                      value={name}
                      meta={meta}
                      taken={Object.keys(proxies)}
                      onChange={this.onNameChange} />
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
        form: state.form.value,
        proxies: state.proxy.value,
        meta: state.meta.value,
        examples: state.example.value,
    };
}

const ProxyForm = connect(mapStateToProps)(BaseProxyForm);
export {ProxyForm};
