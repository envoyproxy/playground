import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {clearForm, updateForm, updateUI} from '../app/store';
import {PlaygroundFormTabs} from '../shared/tabs';
import {
    ServiceConfigurationForm, ServiceEnvironmentForm,
    ServiceForm} from './forms';
import {ContainerError, ContainerStarting} from '../shared/container';
import {ServicePorts} from './ports';
import {ServiceReadme} from './readme';


export class BaseServiceFormModal extends React.Component {
    static propTypes = exact({
        status: PropTypes.string.isRequired,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
    });

    state = {success: false};

    get tabs () {
        const {dispatch, form, service_types} = this.props;
        const {errors, name='', service_type} = form;
        const tabs = {
            Service: (
                <ServiceForm
                  service_types={service_types}
                  form={form}
                />)};
        if (service_type && service_type !== undefined) {
            const service_config = service_types[service_type];
            const {image, labels={}} = service_config;
            if (name.length > 2 && !errors.name) {
                const configPath  = labels['envoy.playground.config.path'];
                if (configPath) {
                    tabs.Configuration = (
                        <ServiceConfigurationForm
                          service_types={service_types}
                          form={form}
                          dispatch={dispatch}
                        />);
                }
                tabs.Environment = (
                    <ServiceEnvironmentForm
                      service_type={service_type}
                      service_types={service_types}
                      form={form}
                      dispatch={dispatch}
                    />)
                ;
                const ports = labels['envoy.playground.ports'];
                if (ports) {
                    tabs.Ports = (
                        <ServicePorts
                          labels={labels}
                          ports={ports} />);
                }
                if (labels['envoy.playground.readme']) {
                    tabs.README = (
                        <ServiceReadme
                          readme={labels['envoy.playground.readme']}
                          title={labels['envoy.playground.service']}
                          description={labels['envoy.playground.description']}
                          image={image}
                          service_type={service_type}
                          logo={labels['envoy.playground.logo']} />);
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
        const {dispatch, form, status, service_types} = this.props;
        const {logs=[], name, service_type, validation} = form;
        const {success} = this.state;
        const messages = {
            default: <span>Pulling container image for service ({name})...</span>,
            success: <span>Service has started ({name})!</span>,
            creating: <span>Creating volumes for service ({name})...</span>,
            start: <span>Starting service container ({name})...</span>};
        if (success) {
            return (
                <ContainerStarting
                  message={messages.success}
                  color='success'
                  icon={service_types[service_type].icon}
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
                  icon={service_types[service_type].icon}
                  iconAlt={name}
                />);
        } else if (status === 'exited' || status === 'destroy' || status === 'die') {
            return (
                <ContainerError
                  icon={service_types[service_type].icon}
                  iconAlt={name}
                  name={name}
                  logs={logs}
                  message={"Failed starting service (" + name  + "). See logs for errors."}
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


const mapModalStateToProps = function(state, other) {
    return {
        service_types: state.service_type.value,
        form: state.form.value,
    };
}

const ServiceFormModal = connect(mapModalStateToProps)(BaseServiceFormModal);
export {ServiceFormModal};
