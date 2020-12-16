
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import EnvoyLogo from '../app/images/envoy.svg';
import {connect} from '../app/store';
import APIResources from '../shared/resources';
import ProxyFormModal from './modals';


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
              logo={EnvoyLogo}
              addModal={{
                  modal: ProxyFormModal,
                  title: this.addModalTitle,
                  action: 'Create proxy'}} />);
    }
}

export const mapStateToProps = function(state) {
    return {
        proxies: state.proxy.value,
    };
};

export default connect(mapStateToProps)(BaseProxyResources);
