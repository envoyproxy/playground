
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {IntlContext} from 'react-intl';

import {connect} from 'react-redux';

import ServiceLogo from '../app/images/service.png';
import APIResources from '../shared/resources';
import ServiceFormModal from './modals';


export class BaseServiceResources extends React.PureComponent {
    static contextType = IntlContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        services: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    getLogo = (service_type) => {
        const {service_types={}} = this.props;
        if (!service_type) {
            return ServiceLogo;
        }
        const _service_type = service_types[service_type] || {};
        const {icon} = _service_type;
        return icon;
    };

    get action () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.service.create.action.create',
            defaultMessage: "Create service"});
    }

    get title () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.resource.title.services',
            defaultMessage: "Services"});
    }

    addModalTitle = (name) => {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.service.create.title',
            defaultMessage: "Create a service"});
    }

    render () {
        const {services} = this.props;
        return (
            <APIResources
              api="service"
              title={this.title}
              resources={services}
              logo={this.getLogo}
              addModal={{
                  modal: ServiceFormModal,
                  title: this.addModalTitle,
                  action: this.action}} />);
    }
}


export const mapStateToProps = (state) => {
    return {
        services: state.service.value,
        service_types: state.service_type.value,
    };
};

export default connect(mapStateToProps)(BaseServiceResources);
