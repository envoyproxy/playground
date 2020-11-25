import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    CustomInput, Col, Label, Input, Row} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../shared/forms';

import BinaryIcon from '../images/binary.png';
import CertificateIcon from '../images/certificate.svg';
import {updateForm} from '../app/store';
import {readFile} from '../utils';
import {ActionCopy, ActionClear, ActionRemove} from '../shared/actions';

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
//  - name
//      - is set
//      - valid chars, not too long/short
//      - unique
//  - certs
//      - number of files
//      - length of each file
//      - valid file extensions for certs ?
//      - valid filenames
//  - binaries
//      - number of files
//      - size of each file
//      - valid filenames

export class BaseProxyForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return [
            "Enter a unique proxy name, and add configuration below.",
            "The proxy will be addressable on any networks it connects to with the proxy name."
        ];
    }

    copyConfig = () => {
        this.textArea._input.select();
        document.execCommand('copy');
    }

    clearConfig = () => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: ''}));
    }

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {errors: _errors={}} = form;
        const {value: name=''} = evt.currentTarget;
        let _fieldErrors = [];
        const errors = {..._errors};
        if (name.length > 32) {
            _fieldErrors.push('Name is too long, max 32 characters');
        }
        const alphanumeric = /^[0-9a-zA-Z\-_\.]+$/;
        if (name.length > 0 && !name.match(alphanumeric)) {
            _fieldErrors.push('Incorrect characters, a-Z and `.`,`_` or `-` only please');
        }
        if (name.indexOf('__') !== -1 || name.indexOf('--') !== -1 || name.indexOf('..') !== -1) {
            _fieldErrors.push('No funny business, only one in a sequence of `.`, `_`, or `-` please');
        }
        errors.name = _fieldErrors;
        dispatch(updateForm({name, errors}));
    }

    onConfigChange = async (code) => {
        // TODO: validate yaml config as yaml, and length.
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: code}));
    }

    render () {
        const {form} = this.props;
        const {configuration=code, name, errors={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  title="Name"
                  label="name">
                  <Col sm={8}>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={name || ""}
                      onChange={this.onChange}
                      placeholder="Enter proxy name" />
                    {(errors.name && errors.name.length > 0) &&
                     <div>Errors! {errors.name}</div>
                    }
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
              <PlaygroundFormGroup>
                <Row>
                  <Label
                    className="text-right"
                    for="configuration"
                    sm={2}>Configuration</Label>
                  <Col sm={8} />
                  <Col sm={2} className="align-text-bottom">
                    <ActionCopy copy={this.copyConfig} />
                    <ActionClear clear={this.clearConfig} />
                  </Col>
                </Row>
                <Editor
                  className="border bg-secondary"
                  value={configuration}
                  onValueChange={this.onConfigChange}
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
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const ProxyForm = connect(mapStateToProps)(BaseProxyForm);
export {ProxyForm};


export class CertificatesListForm extends React.PureComponent {

    render () {
        const {certs} = this.props;
        const onDelete = null;
        const title = '';

        if (Object.keys(certs).length === 0) {
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
                  <Col sm={11} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Path
                    </div>
                  </Col>
                </Row>
                {Object.keys(certs).map((name, index) => {
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white border-bottom">
                              <ActionRemove
                                title={title}
                                name={title}
                                remove={evt => this.onDelete(evt, onDelete)} />
                            </div>
                          </Col>
                          <Col sm={11} className="m-0 p-0 border-bottom bg-white">
                            <img
                              alt={name}
                              src={CertificateIcon}
                              width="18px"
                              className="m-2 ml-1 mr-2"  />
                            certs/{name}
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BaseProxyCertificatesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {certs={}} = form;
        const update = {};
        update[evt.target.files[0].name] = await readFile(evt.target.files[0]);
        dispatch(updateForm({certs: {...certs, ...update}}));
    }

    get messages () {
        return [
            "Add certificates and key files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `certs/` folder."
        ];
    }

    render () {
        const {form} = this.props;
        const {certs={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="certificates"
                  title="Add a cert/key">
                  <Col sm={8}>
                    <CustomInput
                      type="file"
                      onInput={this.onChange}
                      id="certificatesFileBrowser"
                      name="customFile" />
                  </Col>
                </PlaygroundFormGroupRow>
                <CertificatesListForm
                  certs={{...certs}} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const ProxyCertificatesForm = connect(mapStateToProps)(BaseProxyCertificatesForm);
export {ProxyCertificatesForm};


export class BinariesListForm extends React.PureComponent {

    render () {
        const {binaries} = this.props;
        const onDelete = null;
        const title = '';

        if (Object.keys(binaries).length === 0) {
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
                  <Col sm={11} className="m-0 p-0">
                    <div className="p-1 pl-4 bg-dark">
                      Path
                    </div>
                  </Col>
                </Row>
                {Object.keys(binaries).map((name, index) => {
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white border-bottom">
                              <ActionRemove
                                title={title}
                                name={title}
                                remove={evt => this.onDelete(evt, onDelete)} />
                            </div>
                          </Col>
                          <Col sm={11} className="m-0 p-0 border-bottom bg-white">
                              <img
                                alt={name}
                                src={BinaryIcon}
                                width="18px"
                                className="m-2 ml-1 mr-2"  />
                            binary/{name}
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BaseProxyBinariesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {binaries={}} = form;
        const update = {};
        update[evt.target.files[0].name] = await readFile(evt.target.files[0]);
        dispatch(updateForm({binaries: {...binaries, ...update}}));
    }

    get messages () {
        return [
            "Add binary files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `binary/` folder."
        ];
    }

    render () {
        const {form} = this.props;
        const {binaries={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="binaries"
                  title="Add a binary">
                  <Col sm={8}>
                    <CustomInput
                      type="file"
                      value=""
                      onInput={this.onChange}
                      id="binaries"
                      name="customFile" />
                  </Col>
                </PlaygroundFormGroupRow>
                <BinariesListForm
                  binaries={{...binaries}} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const ProxyBinariesForm = connect(mapStateToProps)(BaseProxyBinariesForm);
export {ProxyBinariesForm};


export class BaseProxyLoggingForm extends React.PureComponent {

    get messages () {
        return [
            "Select a log level for your proxy.",
        ];
    }

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {logging={}} = form;
        const update = {default: evt.target.value};
        dispatch(updateForm({logging: {...logging, ...update}}));
    }

    render () {
        const {form} = this.props;
        const {logging={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="log_level"
                  title="Default log level">
                  <Col sm={8}>
                    <CustomInput
                      type="select"
                      id="default-level"
                      value={logging.default}
                      onChange={this.onChange}
                      autocomplete="off"
                      name="default-level">
                      <option>Select log level</option>
                      <option value="info">info (default)</option>
                      <option value="debug">debug</option>
                      <option value="trace">trace</option>
                    </CustomInput>
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const ProxyLoggingForm = connect(mapStateToProps)(BaseProxyLoggingForm);
export {ProxyLoggingForm};
