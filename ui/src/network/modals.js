import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Alert} from 'reactstrap';

import {PlaygroundTabs} from '../shared/tabs';
import {NetworkForm, NetworkProxiesForm, NetworkServicesForm} from './forms';
import CloudLogo from '../images/cloud.svg';


export class BaseNetworkCreating extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    render () {
        const {form} = this.props;
        const {name} = form;
        return (
            <Alert color="info">
              <img
                alt="Network"
                src={CloudLogo}
                width="24px"
                className="mr-2" />
              Creating network ({name})...
            </Alert>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const NetworkCreating = connect(mapStateToProps)(BaseNetworkCreating);
export {NetworkCreating};


export class NetworkModal extends React.PureComponent {
    static propTypes = exact({
        status: PropTypes.string.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    get tabs () {
        const {onUpdate} = this.props;
        return {
            Network: <NetworkForm />,
            Proxies: <NetworkProxiesForm onUpdate={onUpdate} />,
            Services: <NetworkServicesForm onUpdate={onUpdate} />,
        };
    }

    render () {
        const {status} = this.props;
        if (status === "creating") {
            return <NetworkCreating />;
        }
        return (
            <PlaygroundTabs
              tabs={this.tabs} />
        );
    }
}
