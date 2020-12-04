import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert} from 'reactstrap';

import {clearForm, updateForm, updateUI} from '../app/store';
import {ContainerError} from '../shared/error';
import {PortMappingForm} from '../shared/forms';
import {PlaygroundFormTabs} from '../shared/tabs';
import {
    ProxyBinariesForm, ProxyLoggingForm,
    ProxyForm, ProxyCertificatesForm} from './forms';

import EnvoyLogo from '../app/images/envoy.svg';


export class ProxyStarting extends React.PureComponent {
    static propTypes = exact({
        status: PropTypes.string.isRequired,
        form: PropTypes.object.isRequired,
        success: PropTypes.bool
    });

    render () {
        const {form, status, success} = this.props;
        const {name} = form;
        let color = 'info';
        let message = <span>Pulling container image for Envoy proxy ({name})...</span>;
        if (success) {
            message = <span>Envoy proxy has started ({name})!</span>;
            color = 'success';
        } else if (status === 'creating') {
            message = <span>Creating volumes for Envoy proxy ({name})...</span>;
        } else if (status === 'start') {
            message = <span>Starting Envoy proxy container ({name})...</span>;
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


export class ProxyModal extends React.Component {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    state = {success: false};

    get tabs () {
        const {form} = this.props;
        const {name=''} = form;
        let tabs = {Proxy: <ProxyForm />};
        if (name.length > 2) {
            tabs = {
                ...tabs,
                ...{Logging: (
                    <ProxyLoggingForm />),
                    Certificates: (
                        <ProxyCertificatesForm />),
                    Binaries: (
                        <ProxyBinariesForm />),
                    Ports: (
                        <PortMappingForm />)}};
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
        const {dispatch, form} = this.props;
        const {success} = this.state;
        const {logs=[], name, status, validation} = form;
        if (success) {
            return (
                <ProxyStarting success={success} form={form} status={status} />);
        }

        if (status === 'initializing' || status === 'creating' || status === 'start') {
            if (status === 'start') {
                this.timer = setTimeout(this.updateStatus, 1000);
            }
            return (
                <ProxyStarting form={form} status={status} />
            );
        } else if (status === 'exited' || status === 'destroy' || status === 'die') {
            return (
                <ContainerError
                  icon={EnvoyLogo}
                  iconAlt="Envoy"
                  name={name}
                  logs={logs}
                  message={"Failed starting Envoy proxy (" + name  + "). See logs for errors."}
                  onReconfigure={evt => dispatch(updateForm({status: null}))}
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
