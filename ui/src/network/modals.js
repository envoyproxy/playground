import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {PlaygroundFormTabs} from '../shared/tabs';
import {ContainerStarting} from '../shared/container';
import {NetworkForm, NetworkConnectionsForm} from './forms';
import {clearForm, updateUI} from '../app/store';
import CloudLogo from '../app/images/cloud.svg';


export class BaseNetworkFormModal extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        proxies: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return {
            services: ["Add and remove services from this network"],
            proxies: ["Add and remove proxies from this network"]};
    }

    get tabs () {
        const {form, onUpdate, proxies, services} = this.props;
        const {
            name='', errors={},
            proxies: connectedProxies=[],
            services: connectedServices=[]} = form;
        const tabs = {
            Network: <NetworkForm />,
        };
        if ((name.length > 2 && !errors.name) && Object.keys(proxies).length > 0){
            const tabTitle = 'Proxies (' + connectedProxies.length + '/' + Object.keys(proxies).length + ')';
            tabs[tabTitle] = (
                <NetworkConnectionsForm
                  messages={this.messages.proxies}
                  type="proxies"
                  onUpdate={onUpdate}
                />);

        }
        if ((name.length > 2 && !errors.name) && Object.keys(services).length > 0){
            const tabTitle = 'Services (' + connectedServices.length + '/' + Object.keys(services).length + ')';
            tabs[tabTitle] = (
                <NetworkConnectionsForm
                  messages={this.messages.services}
                  type="services"
                  onUpdate={onUpdate}
                />);
        }
        return tabs;
    }

    updateStatus = () => {
        const {status} = this.props;
        if (status === 'create') {
            this.setState({success: true});
            this.timer = setTimeout(this.closeModal, 1000);
        }
    }

    closeModal = () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: null}));
        dispatch(clearForm());
    }

    render () {
        const {form} = this.props;
        const {success, status, validation} = form;
        const {name} = form;
        console.log('NETWORK', status, success, form);
        let color = 'info';
        const messages = {
            initializing: [30,  <span>Creating network ({name})...</span>],
            create: [100,  <span>Network created ({name})...</span>]};
        if (status === "initializing" || status === 'create') {
            if (status === 'create') {
                color = 'success';
                this.timer = setTimeout(this.updateStatus, 1000);
            }
            return (
                <ContainerStarting
                  progress={messages[status][0]}
                  message={messages[status][1]}
                  color={color}
                  icon={CloudLogo}
                  iconAlt={name}
                />);
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
        proxies: state.proxy.value,
        services: state.service.value,
    };
}

const NetworkFormModal = connect(mapModalStateToProps)(BaseNetworkFormModal);
export {NetworkFormModal};
