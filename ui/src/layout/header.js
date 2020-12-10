
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    ActionClear,
    ActionLoad, ActionSave} from '../shared/actions';
import {PlaygroundContext} from '../app/context';
import EnvoyLogo from '../app/images/envoy.svg';


class BaseHeader extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
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

const mapStateToProps = function(state) {
    return {
        version: state.meta.value.version
    };
}

const Header = connect(mapStateToProps)(BaseHeader);
export default Header;
