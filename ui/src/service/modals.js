import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {PlaygroundFormModal} from '../shared/modal';
import {
    ServiceConfigurationForm, ServiceEnvironmentForm,
    ServiceForm} from './forms';
import {ServicePorts} from './ports';
import {ServiceReadme} from './readme';


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

    get image () {
        const {image} = this.service_config;
        return image;
    }

    get labels () {
        const {labels={}} = this.service_config;
        return labels;
    }

    get ports () {
        return this.labels['envoy.playground.ports'] || '';
    };

    get service_config () {
        const {service_types} = this.props;
        return service_types[this.service_type] || {};
    }

    get service_type () {
        const {form} = this.props;
        const {service_type} = form;
        return service_type;
    }

    get tabConfiguration () {
        const {dispatch, form, service_types} = this.props;
        return (
            <ServiceConfigurationForm
              service_types={service_types}
              form={form}
              dispatch={dispatch}
            />);
    }

    get tabEnvironment () {
        const {dispatch, form, service_types} = this.props;
        const {service_type} = form;
        return (
            <ServiceEnvironmentForm
              service_type={service_type}
              service_types={service_types}
              form={form}
              dispatch={dispatch}
            />);
    }

    get tabPorts () {
        return (
            <ServicePorts
              labels={this.labels}
              ports={this.ports} />);
    }

    get tabReadme () {
        return (
            <ServiceReadme
              readme={this.labels['envoy.playground.readme']}
              title={this.labels['envoy.playground.service']}
              description={this.labels['envoy.playground.description']}
              image={this.image}
              service_type={this.service_type}
              logo={this.labels['envoy.playground.logo']} />);
    }

    get tabService () {
        const {form, service_types} = this.props;
        return (
            <ServiceForm
              service_types={service_types}
              form={form}
            />);
    }

    get tabs () {
        const {form} = this.props;
        const {errors, name='', service_type} = form;
        const tabs = {Service: this.tabService};
        const isValid = (
            service_type
                && service_type !== undefined
                && name.length > 2
                && !errors.name);
        if (!isValid) {
            return tabs;
        }
        if (this.labels['envoy.playground.config.path']) {
            tabs.Configuration = this.tabConfiguration;
        }
        tabs.Environment = this.tabEnvironment;
        tabs.Ports = this.tabPorts;
        tabs.README = this.tabReadme;
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


const mapModalStateToProps = function(state, other) {
    return {
        service_types: state.service_type.value,
        form: state.form.value,
    };
};

export default connect(mapModalStateToProps)(BaseServiceFormModal);
