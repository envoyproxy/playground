import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import APIResources from '../shared/resources';
import CloudLogo from '../app/images/cloud.svg';
import {connect} from '../app/store';
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
              editable={true}
              addModal={{
                  modal: NetworkFormModal,
                  title: this.addModalTitle,
                  editClose: "Close",
                  action: 'Create network'}}
              resources={networks} />);
    }
}


export const mapStateToProps = function(state) {
    return {
        networks: state.network.value,
    };
};

export default connect(mapStateToProps)(BaseNetworkResources);
