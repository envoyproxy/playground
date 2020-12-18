
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {IntlContext} from 'react-intl';

import {connect} from 'react-redux';

import EnvoyLogo from '../app/images/envoy.svg';
import APIResources from '../shared/resources';
import ProxyFormModal from './modals';


export class BaseProxyResources extends React.PureComponent {
    static contextType = IntlContext;
    static propTypes = exact({
        dispatch: PropTypes.func,
        proxies: PropTypes.object.isRequired,
    });

    addModalTitle = (name) => {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.proxy.create.title',
            defaultMessage: "Create an Envoy proxy"});
    }

    get action () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.proxy.create.action.create',
            defaultMessage: "Create proxy"});
    }

    get title () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.resource.title.proxies',
            defaultMessage: "Proxies"});
    }

    render () {
        const {proxies} = this.props;
        return (
            <APIResources
              api="proxy"
              title={this.title}
              resources={proxies}
              logo={EnvoyLogo}
              addModal={{
                  modal: ProxyFormModal,
                  title: this.addModalTitle,
                  action: this.action}} />);
    }
}

export const mapStateToProps = function(state) {
    return {
        proxies: state.proxy.value,
    };
};

export default connect(mapStateToProps)(BaseProxyResources);
