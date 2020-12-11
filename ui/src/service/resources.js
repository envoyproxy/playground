
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import ServiceLogo from '../app/images/service.png';
import {connect} from '../app/store';
import APIResources from '../shared/resources';
import {ServiceFormModal} from './modals';


export class BaseServiceResources extends React.PureComponent {
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

    addModalTitle = (name) => {
        return "Create a service";
    }

    render () {
        const {services} = this.props;
        return (
            <APIResources
              api="service"
              title="Services"
              resources={services}
              logo={this.getLogo}
              addModal={{
                  modal: ServiceFormModal,
                  title: this.addModalTitle,
                  action: 'Create service'}} />);
    }
}


export const mapStateToProps = (state) => {
    return {
        services: state.service.value,
        service_types: state.service_type.value,
    };
};

export default connect(mapStateToProps)(BaseServiceResources);
