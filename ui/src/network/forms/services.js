import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {NetworkConnectionsForm} from './base';


export class BaseNetworkServicesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    get messages () {
        return ["Add and remove services from this network"];
    }

    render () {
        const {
            dispatch, form, networks,
            onUpdate, proxies} = this.props;
        return (
            <NetworkConnectionsForm
              dispatch={dispatch}
              messages={this.messages}
              networks={networks}
              connections={proxies}
              type="proxies"
              form={form}
              onUpdate={onUpdate}
            />
        );
    }
}

const mapNetworkServicesStateToProps = function(state, other) {
    return {
        networks: state.network.value,
        services: state.service.value,
        form: state.form.value,
    };
}

const NetworkServicesForm = connect(mapNetworkServicesStateToProps)(BaseNetworkServicesForm);
export {NetworkServicesForm};
