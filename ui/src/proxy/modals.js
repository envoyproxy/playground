
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {clearForm, updateForm, updateUI} from '../app/store';
import {ContainerError, ContainerStarting} from '../shared/container';
import {PortMappingForm} from '../shared/forms';
import {PlaygroundFormTabs} from '../shared/tabs';
import {
    ProxyBinariesForm, ProxyLoggingForm,
    ProxyForm, ProxyCertificatesForm} from './forms';

import EnvoyLogo from '../app/images/envoy.svg';


export class ProxyModal extends React.Component {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    state = {success: false};

    get tabs () {
        const {dispatch, form} = this.props;
        const {name=''} = form;
        let tabs = {Proxy: <ProxyForm form={form} />};
        if (name.length > 2) {
            tabs = {
                ...tabs,
                ...{Logging: (
                    <ProxyLoggingForm
                      dispatch={dispatch}
                      form={form}
                    />),
                    Ports: (
                        <PortMappingForm
                          dispatch={dispatch}
                          form={form}
                        />),
                    Certificates: (
                        <ProxyCertificatesForm
                          dispatch={dispatch}
                          form={form}
                        />),
                    Binaries: (
                        <ProxyBinariesForm
                          dispatch={dispatch}
                          form={form}
                        />)}};
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
        const messages = {
            default: <span>Pulling container image for Envoy proxy ({name})...</span>,
            success: <span>Envoy proxy has started ({name})!</span>,
            creating: <span>Creating volumes for Envoy proxy ({name})...</span>,
            start: <span>Starting Envoy proxy container ({name})...</span>};
        if (success) {
            return (
                <ContainerStarting
                  message={messages.success}
                  color='success'
                  icon={EnvoyLogo}
                  iconAlt={name}
                />);
        }
        if (status === 'initializing' || status === 'creating' || status === 'start') {
            if (status === 'start') {
                this.timer = setTimeout(this.updateStatus, 1000);
            }
            return (
                <ContainerStarting
                  message={messages[status] || messages.default}
                  color='info'
                  icon={EnvoyLogo}
                  iconAlt={name}
                />);
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
