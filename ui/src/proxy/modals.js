
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundFormModal} from '../shared/modal';
import {
    ProxyBinariesForm, ProxyLoggingForm,
    ProxyForm, ProxyCertificatesForm,
    ProxyPortsForm} from './forms';

import EnvoyLogo from '../app/images/envoy.svg';


export class ProxyFormModal extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get activityMessages () {
        const {form} = this.props;
        const {name} = form;
        return {
            default: [[10, 20],  <span>Creating Envoy proxy ({name})...</span>],
            pull_start: [[20, 50],  <span>Pulling container image for Envoy proxy ({name})...</span>],
            build_start: [[50, 80],  <span>Building container image for Envoy proxy ({name})...</span>],
            volume_create: [[80, 90],  <span>Creating volumes for Envoy proxy ({name})...</span>],
            start: [[90, 100],  <span>Starting Envoy proxy container ({name})...</span>],
            success: [[100, 100],  <span>Envoy proxy has started ({name})!</span>]};
    }

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
                        <ProxyPortsForm
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

    render () {
        const {form} = this.props;
        const {name=''} = form;
        return (
            <PlaygroundFormModal
              type="proxy"
              icon={EnvoyLogo}
              messages={this.activityMessages}
              failMessage={"Failed starting Envoy proxy (" + name  + "). See logs for errors."}
              success='start'
              fail={['exited', 'destroy', 'die']}
              tabs={this.tabs} />
        );
    }
}
