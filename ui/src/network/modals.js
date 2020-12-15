import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {NetworkForm, NetworkConnectionsForm} from './forms';
import {PlaygroundFormModal} from '../shared/modal';
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

    get activityMessages () {
        const {form} = this.props;
        const {name} = form;
        return {
            default: [[30, 100],  <span>Creating network ({name})...</span>],
            success: [[100, 100],  <span>Network created ({name})...</span>]};
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

    render () {
        return (
            <PlaygroundFormModal
              icon={CloudLogo}
              messages={this.activityMessages}
              success='create'
              successTimeout={1000}
              tabs={this.tabs} />
        );
    }
}


const mapModalStateToProps = function(state, other) {
    return {
        form: state.form.value,
        proxies: state.proxy.value,
        services: state.service.value,
    };
};


const NetworkFormModal = connect(mapModalStateToProps)(BaseNetworkFormModal);
export {NetworkFormModal};
