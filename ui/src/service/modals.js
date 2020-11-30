import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';

import {Alert, Col, Row} from 'reactstrap';

import {clearForm, updateForm, updateUI} from '../app/store';
import {AlertStartFailed} from '../shared/alerts';
import {PlaygroundFailLogs} from '../shared/logs';
import {PlaygroundFormTabs} from '../shared/tabs';

import {ServiceConfigurationForm, ServiceEnvironmentForm, ServiceForm} from './forms';


export class ServiceREADME extends React.Component {
    static propTypes = exact({
        url: PropTypes.string.isRequired,
    });

    state = {content: ''}

    async componentDidMount () {
        const {url} = this.props;
        const response = await fetch(url);
        const content = await response.text();
        this.setState({content});
    }

    render () {
        const {content} = this.state;
        return (
            <>
              <ReactMarkdown className="readme m-2 bg-light p-2 pl-3">{content}</ReactMarkdown>
            </>
        );
    }
}



export class BaseServiceError extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    render () {
        const {dispatch, form, service_types} = this.props;
        const {logs=[], name} = form;
        const {service_type} = form;
        const message = "Failed starting service (" + name  + "). See logs for errors.";
        return (
            <>
              <AlertStartFailed
                onReconfigure={evt => dispatch(updateForm({status: null}))}
                message={message}
                icon={service_types[service_type].icon}
                alt="Service logo" />
              <Row className="pt-2 bg-light ml-0 mr-0">
                <Col sm={12}>
                  <PlaygroundFailLogs logs={logs} />
                </Col>
              </Row>
            </>
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
        status: PropTypes.string.isRequired,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        success: PropTypes.bool,
    });

    render () {
        const {form, status, success, service_types} = this.props;
        const {name, service_type} = form;
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
                alt="Service logo"
                src={service_types[service_type].icon}
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
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
    });

    state = {success: false};

    get tabs () {
        const {form, service_types} = this.props;
        const {errors, name, service_type} = form;
        let showReadme = false;
        if (service_type) {
            const service_config = service_types[service_type];
            const {labels={}} = service_config;
            if (Object.keys(labels).indexOf('envoy.playground.readme') !== -1) {
                showReadme = [
                    'http://localhost:8000/static',
                    service_type,
                    labels['envoy.playground.readme']].join('/');
            }
        }

        const tabs = {Service: <ServiceForm />};
        if (service_type && service_type !== undefined) {
            if (name.length > 2 && !errors.name) {
                const configPath  = service_types[service_type]['labels']['envoy.playground.config.path'];
                if (configPath) {
                    tabs.Configuration = <ServiceConfigurationForm />;
                }
                tabs.Environment = <ServiceEnvironmentForm service_type={service_type} />;
                if (showReadme) {
                    tabs.README = <ServiceREADME url={showReadme} />;
                }
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
        const {form, status, service_types} = this.props;
        const {validation} = form;
        const {success} = this.state;

        if (success) {
            return (
                <ServiceStarting
                  success={success}
                  form={form}
                  status={status}
                  service_types={service_types}
                />);
        }
        if (status === 'initializing' || status === 'creating' || status === 'start') {
            if (status === 'start') {
                this.timer = setTimeout(this.updateStatus, 1000);
            }
            return (
                <ServiceStarting
                  form={form}
                  status={status}
                  service_types={service_types}
                />
            );
        } else if (status === 'exited' || status === 'destroy' || status === 'die') {
            return (
                <ServiceError
                  service_types={service_types}
                />
            );
        }
        return (
            <PlaygroundFormTabs
              validation={validation}
              tabs={this.tabs} />
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
