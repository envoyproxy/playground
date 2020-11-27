import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {ServiceConfigurationForm, ServiceEnvironmentForm, ServiceForm} from './forms';

import {connect} from 'react-redux';

import {Alert, Button, Col, Label, Row} from 'reactstrap';

import {ActionCopy} from '../shared/actions';
import {PlaygroundTabs} from '../shared/tabs';
import {clearForm, updateForm, updateUI} from '../app/store';

import EnvoyLogo from '../images/envoy.svg';

import Editor from 'react-simple-code-editor';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';



export class BaseServiceError extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    copyConfig = () => {
        this.textArea._input.select();
        document.execCommand('copy');
    }

    render () {
        const {dispatch, form} = this.props;
        const {logs=[], name} = form;
        return (
            <div>
              <Alert color="danger">
                <Button
                  className="float-right"
                  onClick={evt => dispatch(updateForm({status: null}))}
                  size="sm"
                  color="info">
                  Reconfigure
                </Button>
                <img
                  alt="Envoy logo"
                  src={EnvoyLogo}
                  width="24px"
                  className="mr-2" />
                Failed starting Envoy service ({name}). See logs for errors.
              </Alert>

              <Row className="bg-light ml-0 mr-0">
                <Label
                  className="pl-5"
                  sm={2}
                  for="configuration">Logs</Label>
                <Col sm={8} />
                <Col sm={2} className="align-text-bottom">
                  <ActionCopy copy={this.copyConfig} />
                </Col>
              </Row>
              <Row className="pt-2 bg-light ml-0 mr-0">
              <Col sm={12}>
              <Editor
                className="border bg-light"
                value={logs.join('')}
                onValueChange={code => {
                    this.setState({ code });
                    // onUpdate({configuration: code});
                }}
                // highlight={code => highlight(code, languages["shell-session"])}
                highlight={code => code}
                padding={10}
                name="configuration"
                id="configuration"
                ref={(textarea) => this.textArea = textarea}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                }} />
              </Col>
              </Row>
            </div>
        );
    }
}

const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const ServiceError = connect(mapStateToProps)(BaseServiceError);
export {ServiceError};


export class ServiceStarting extends React.PureComponent {
    static propTypes = exact({
        status: PropTypes.object.isRequired,
    });

    render () {
        const {form, status, success} = this.props;
        const {name} = form;
        let color = 'info';

        let message = <span>Pulling container image for service ({name})...</span>;
        if (success) {
            message = <span>Service has started ({name})!</span>;
            color = 'success';
        } else if (status === 'creating') {
            message = <span>Creating volumes for service ({name})...</span>;
        } else if (status === 'start') {
            message = <span>Starting service container ({name})...</span>;
        }
        return (
            <Alert color={color}>
              <img
                alt="Envoy logo"
                src={EnvoyLogo}
                width="24px"
                className="mr-2" />
              {message}
            </Alert>
        );
    }
}


export class BaseServiceModal extends React.Component {
    static propTypes = exact({
        status: PropTypes.string.isRequired,
        service_types: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    state = {success: false};

    get tabs () {
        const {form, service_types} = this.props;
        const {errors, name, service_type} = form;
        const tabs = {Service: <ServiceForm />};
        if (service_type && service_type !== undefined) {
            if (name.length > 2 && !errors.name) {
                const configPath  = service_types[service_type]['labels']['envoy.playground.config.path'];
                if (configPath) {
                    tabs.Configuration = <ServiceConfigurationForm />;
                }
                tabs.Environment = <ServiceEnvironmentForm service_type={service_type} />;
            }
        }
        return tabs;
    }

    updateStatus = () => {
        const {status} = this.props;
        if (status === 'start') {
            this.setState({success: true});
            this.timer = setTimeout(this.closeModal, 1000);
        }
    }

    closeModal = () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: null}));
        dispatch(clearForm());
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render () {
        const {form, status} = this.props;
        const {validation} = form;
        const {success} = this.state;

        if (success) {
            return (
                <ServiceStarting
                  success={success}
                  form={form}
                  status={status} />);
        }
        if (status === 'initializing' || status === 'creating' || status === 'start') {
            if (status === 'start') {
                this.timer = setTimeout(this.updateStatus, 1000);
            }
            return (
                <ServiceStarting form={form} status={status} />
            );
        } else if (status === 'exited' || status === 'destroy' || status === 'die') {
            return (
                <ServiceError />
            );
        }
        return (
            <>
              {validation &&
               <Alert color="danger">
                 {Object.entries(validation).map(([k, v], i) => {
                     return (
                         <Row>
                           <Col sm={1} className="font-weight-bold">
                             &nbsp;
                           </Col>
                           <Col sm={2} className="font-weight-bold">
                             {k}
                           </Col>
                           <Col sm={9}>
                             {v}
                           </Col>
                         </Row>
                     );
                 })}
               </Alert>
              }
              <PlaygroundTabs
                tabs={this.tabs} />
            </>
        );
    }
}


const mapModalStateToProps = function(state, other) {
    return {
        service_types: state.service_type.value,
        form: state.form.value,
    };
}

const ServiceModal = connect(mapModalStateToProps)(BaseServiceModal);
export {ServiceModal};
