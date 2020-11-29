import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import APIResources from '../shared/resources';
import CloudLogo from '../app/images/cloud.svg';
import {NetworkModal} from './modals';


export class BaseNetworkResources extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        modals: PropTypes.object.isRequired,
    });

    modalTitle = (name, edit) => {
        if (edit) {
            return "Update network (" +  name + ")";
        }
        return "Create a network";
    }

    render () {
        const {modals, networks} = this.props;
        return (
            <APIResources
              api="network"
              title="Networks"
              logo={CloudLogo}
              modals={modals}
              editable={true}
              editClose="Close"
              modal={NetworkModal}
              modalTitle={this.modalTitle}
              modalAction="Create network"
              resources={networks} />);
    }
}


const mapStateToProps = function(state) {
    return {
        networks: state.network.value,
    };
}

const NetworkResources = connect(mapStateToProps)(BaseNetworkResources);

export default NetworkResources;
