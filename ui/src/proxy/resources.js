
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import EnvoyLogo from '../app/images/envoy.svg';
import APIResources from '../shared/resources';
import {ProxyModal} from './modals';


export class BaseProxyResources extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        proxies: PropTypes.object.isRequired,
    });

    addModalTitle = (name) => {
        return "Create an Envoy proxy";
    }

    render () {
        const {proxies} = this.props;
        return (
            <APIResources
              api="proxy"
              title="Proxies"
              resources={proxies}
              addModal={{
                  modal: ProxyModal,
                  title: this.addModalTitle,
                  logo: EnvoyLogo,
                  action: 'Create proxy'}} />);
    }
}

const mapStateToProps = function(state) {
    return {
        proxies: state.proxy.value,
    };
}

const ProxyResources = connect(mapStateToProps)(BaseProxyResources);
export default ProxyResources;
