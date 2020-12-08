import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Alert} from 'reactstrap';

import {PlaygroundFormTabs} from '../shared/tabs';
import {NetworkForm, NetworkConnectionsForm} from './forms';
import CloudLogo from '../app/images/cloud.svg';


export class BaseNetworkCreating extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    render () {
        const {form} = this.props;
        const {name} = form;
        return (
            <Alert color="info">
              <img
                alt="Network"
                src={CloudLogo}
                width="24px"
                className="mr-2" />
              Creating network ({name})...
            </Alert>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const NetworkCreating = connect(mapStateToProps)(BaseNetworkCreating);
export {NetworkCreating};


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
        const {name='', errors={}} = form;
        const tabs = {
            Network: <NetworkForm />,
        };
        if ((name.length > 2 && !errors.name) && Object.keys(proxies).length > 0){
            tabs.Proxies = (
                <NetworkConnectionsForm
                  messages={this.messages.proxies}
                  type="proxies"
                  onUpdate={onUpdate}
                />);

        }
        if ((name.length > 2 && !errors.name) && Object.keys(services).length > 0){
            tabs.Services = (
                <NetworkConnectionsForm
                  messages={this.messages.services}
                  type="services"
                  onUpdate={onUpdate}
                />);
        }
        return tabs;
    }

    render () {
        const {form, status} = this.props;
        const {validation} = form;
        if (status === "creating") {
            return <NetworkCreating />;
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
