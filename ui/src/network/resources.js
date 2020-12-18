
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {IntlContext} from 'react-intl';

import {connect} from 'react-redux';

import CloudLogo from '../app/images/cloud.svg';
import APIResources from '../shared/resources';
import NetworkFormModal from './modals';


export class BaseNetworkResources extends React.PureComponent {
    static contextType = IntlContext;
    static propTypes = exact({
        dispatch: PropTypes.func,
        networks: PropTypes.object.isRequired,
    });

    addModalTitle = (name, edit) => {
        if (edit) {
            return "Update network (" +  name + ")";
        }
        return "Create a network";
    }

    get action () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.network.create.action.create',
            defaultMessage: "Create network"});
    }

    get actionClose () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.form.network.create.action.close',
            defaultMessage: "Close"});
    }

    get title () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.resource.title.networks',
            defaultMessage: "Networks"});
    }

    render () {
        const {networks} = this.props;
        return (
            <APIResources
              api="network"
              title={this.title}
              logo={CloudLogo}
              editable={true}
              addModal={{
                  modal: NetworkFormModal,
                  title: this.addModalTitle,
                  editClose: this.actionClose,
                  action: this.action}}
              resources={networks} />);
    }
}


export const mapStateToProps = function(state) {
    return {
        networks: state.network.value,
    };
};

export default connect(mapStateToProps)(BaseNetworkResources);
