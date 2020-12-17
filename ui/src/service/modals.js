
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {PlaygroundFormModal} from '../shared/modal';
import {
    ServiceConfigurationForm, ServiceEnvironmentForm,
    ServiceForm} from './forms';
import ServicePorts from './ports';
import ServiceReadme from './readme';


export class BaseServiceFormModal extends React.PureComponent {
    static propTypes = exact({
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
    });

    get activityMessages () {
        const {form} = this.props;
        const {name} = form;
        return {
            default: [[10, 30], <span>Creating service ({name})...</span>],
            pull_start: [[30, 50], <span>Pulling container image for service ({name})...</span>],
            volume_create: [[50, 70], <span>Creating volumes for service ({name})...</span>],
            start: [[70, 100], <span>Starting service container ({name})...</span>],
            success: [[100, 100], <span>Service has started ({name})!</span>]};
    }

    get failMessage () {
        const {form} = this.props;
        const {name, service_type} = form;
        return `Failed starting ${service_type} service (${name}). See logs for errors.`;
    }

    get tabs () {
        const {form, service_types} = this.props;
        const {errors, name='', service_type} = form;
        const tabs = {Service: <ServiceForm />};
        const isValid = (
            service_type
                && service_type !== undefined
                && name.length > 2
                && !errors.name);
        if (!isValid) {
            return tabs;
        }
        const {labels={}} = service_types[service_type];
        if (labels['envoy.playground.config.path']) {
            tabs.Configuration = <ServiceConfigurationForm />;
        }
        tabs.Environment = <ServiceEnvironmentForm />;
        tabs.Ports = (
            <ServicePorts
              labels={labels}
              ports={labels['envoy.playground.ports'] || ''} />);
        tabs.README = <ServiceReadme service_type={service_type} />;
        return tabs;
    }

    render () {
        const {form, service_types} = this.props;
        const {service_type} = form;
        return (
            <PlaygroundFormModal
              icon={(service_types[service_type] || {}).icon}
              messages={this.activityMessages}
              failMessage={this.failMessage}
              success='start'
              fail={['exited', 'destroy', 'die']}
              tabs={this.tabs} />
        );
    }
}


export const mapStateToProps = function(state, other) {
    return {
        service_types: state.service_type.value,
        form: state.form.value,
    };
};

export default connect(mapStateToProps)(BaseServiceFormModal);
