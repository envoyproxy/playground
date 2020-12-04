import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Alert} from 'reactstrap';

import {clearForm, updateUI} from '../app/store';
import {PlaygroundFormTabs} from '../shared/tabs';
import {
    ServiceConfigurationForm, ServiceEnvironmentForm,
    ServiceForm} from './forms';
import {ServiceError} from './error';
import {ServicePorts} from './ports';
import {ServiceReadme} from './readme';


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
        const {errors, name='', service_type} = form;
        const tabs = {Service: <ServiceForm />};
        if (service_type && service_type !== undefined) {
            const service_config = service_types[service_type];
            const {image, labels={}} = service_config;
            if (name.length > 2 && !errors.name) {
                const configPath  = labels['envoy.playground.config.path'];
                if (configPath) {
                    tabs.Configuration = <ServiceConfigurationForm />;
                }
                tabs.Environment = <ServiceEnvironmentForm service_type={service_type} />;
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
