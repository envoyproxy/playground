import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    Alert, Col, Label, Input, Row} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../shared/forms';

import {updateForm} from '../../app/store';
import {ActionCopy, ActionClear} from '../../shared/actions';

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
    });

    copyConfig = () => {
        this.textArea._input.select();
        document.execCommand('copy');
    }

    clearConfig = () => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: ''}));
    }

    render ()  {
        const {configuration, errors, onChange} = this.props;
        return (
            <PlaygroundFormGroup>
              <Row>
                <Label
                  className="text-right"
                  for="configuration"
                  sm={2}>Configuration*</Label>
                <Col sm={8} />
                <Col sm={2} className="align-text-bottom">
                  <ActionCopy copy={this.copyConfig} />
                  <ActionClear clear={this.clearConfig} />
                </Col>
              </Row>
              {(errors.configuration || []).map((e, i) => {
                  return (
                      <Alert
                        className="p-1 mt-2 mb-2"
                        color="danger"
                        key={i}>{e}</Alert>
                  );
              })}
              <Editor
                className="border bg-secondary"
                value={configuration}
                onValueChange={onChange}
                highlight={code => highlight(code, languages.yaml)}
                padding={10}
                name="configuration"
                id="configuration"
                ref={(textarea) => this.textArea = textarea}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                }}
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
    });

    get messages () {
        return [
            "Enter a unique proxy name, and add configuration below.",
            "The proxy will be addressable on any networks it connects to with the proxy name."
        ];
    }

    validateName = (name, errors) => {
        const {proxies, meta} = this.props;
        const {max_name_length, min_name_length} = meta;
        let valid = true;
        errors = errors || {};
        errors.name = [];

        if (name.length < parseInt(min_name_length)) {
            valid = false;
        }

        if (name.length > parseInt(max_name_length)) {
            valid = false;
            errors.name.push('Proxy name too long, maximum ' + max_name_length + ' chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (name.indexOf(forbidden) !== -1) {
                valid = false;
                errors.name.push('Proxy name cannot contain \'' + forbidden + '\'');
            }
        }
        if (name.length > 0 && !name.match(/[a-z]+[a-z0-9.\-_]*$/)) {
            valid = false;
            errors.name.push('Proxy name contains forbidden characters');
        }
        if (Object.keys(proxies).indexOf(name) !== -1) {
            valid = false;
            errors.name.push('Proxy name exists already');
        }

        if (valid) {
            delete errors.name;
        }
        return valid;
    };

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

    onChange = async (evt) => {
        const {form,  dispatch} = this.props;
        const {errors: _errors={}, configuration=''} = form;
        const errors = {..._errors};
        const name = evt.currentTarget.value.toLowerCase();
        let valid = true;
        if (!this.validateConfiguration(configuration, errors)) {
            valid = false;
        }
        if (!this.validateName(name, errors)) {
            valid = false;
        }
        dispatch(updateForm({errors, valid, name}));
    }

    onConfigChange = async (configuration) => {
        // TODO: validate yaml config as yaml, and length.
        const {form,  dispatch} = this.props;
        const {errors: _errors={}, name=''} = form;
        const errors = {..._errors};
        let valid = true;
        if (!this.validateConfiguration(configuration, errors)) {
            valid = false;
        }
        if (!this.validateName(name, errors)) {
            valid = false;
        }
        dispatch(updateForm({errors, valid, configuration}));
    }

    render () {
        const {dispatch, form, meta} = this.props;
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
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={name || ""}
                      onChange={this.onChange}
                      placeholder="Enter proxy name" />
                    {(errors.name || []).map((e, i) => {
                        return (
                            <Alert
                              className="p-1 mt-2 mb-2"
                              color="danger"
                              key={i}>{e}</Alert>
                        );
                    })}
                  </Col>
                </PlaygroundFormGroupRow>
                {showConfig &&
                 <ProxyConfigForm
                   configuration={configuration}
                   errors={errors}
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
    };
}

const ProxyForm = connect(mapStateToProps)(BaseProxyForm);
export {ProxyForm};
