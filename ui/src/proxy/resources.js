import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import APIResources from '../shared/resources';
import EnvoyLogo from '../app/images/envoy.svg';
import {ProxyModal} from './modals';


export class BaseProxyResources extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        proxies: PropTypes.object.isRequired,
        modals: PropTypes.object.isRequired,
    });

    modalTitle = (name) => {
        return "Create an Envoy proxy";
    }

    render () {
        const {modals, proxies} = this.props;
        return (
            <APIResources
              api="proxy"
              title="Proxies"
              logo={EnvoyLogo}
              resources={proxies}
              modal={ProxyModal}
              modalTitle={this.modalTitle}
              modalAction="Create proxy"
              modals={modals} />);
    }
}

const mapStateToProps = function(state) {
    return {
        proxies: state.proxy.value,
    };
}

const ProxyResources = connect(mapStateToProps)(BaseProxyResources);
export default ProxyResources;
