
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    ActionClear,
    ActionLoad, ActionSave} from '../shared/actions';
import EnvoyLogo from '../app/images/envoy.svg';


export class BaseHeader extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        version: PropTypes.string,
    });

    render () {
        const {version} = this.props;
        return (
            <header>
              <img
                alt="Envoy logo"
                src={EnvoyLogo}
                width="28px"
                className="ml-1 mr-2" />
	      <span>Envoy playground ({version})</span>
              <ActionClear />
              <ActionLoad />
              <ActionSave />
            </header>);
    }
}


export const mapStateToProps = function(state) {
    return {
        version: state.meta.value.version
    };
};

export default connect(mapStateToProps)(BaseHeader);
