import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import APIResources from '../shared/resources';
import CloudLogo from '../app/images/cloud.svg';
import {NetworkFormModal} from './modals';


export class BaseNetworkResources extends React.PureComponent {
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

    render () {
        const {networks} = this.props;
        return (
            <APIResources
              api="network"
              title="Networks"
              logo={CloudLogo}
              addModal={{
                  modal: NetworkFormModal,
                  title: this.addModalTitle,
                  editable: true,
                  editClose: "Close",
                  action: 'Create network'}}
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
