import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    ActionClear,
    ActionLoad, ActionSave} from '../shared/actions';
import {APIContext} from '../app/context';
import EnvoyLogo from '../images/envoy.svg';
import {updateUI} from '../app/store';


class BaseHeader extends React.PureComponent {
    static contextType = APIContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        version: PropTypes.string,
    });

    clear = async () => {
        await this.context.get('/clear');
    };

    save = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    load = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    render () {
        const {version} = this.props;
        return (
            <header className="App-header bg-dark border-bottom border-dark">
              <img
                alt="Envoy logo"
                src={EnvoyLogo}
                width="28px"
                className="ml-1 mr-2" />
	      <span>Envoy playground ({version})</span>
              <ActionClear
                className="ml-2 mb-0 float-right mt-1 mr-5"
                clear={this.clear} />
              <ActionLoad load={this.load} />
              <ActionSave save={this.save} />
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
