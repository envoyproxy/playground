
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {
    ActionClear,
    ActionLoad, ActionSave} from '../actions';


export class BasePlaygroundSaveLoadWidget extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
    });

    render () {
        const {dispatch, title, version} = this.props;
        return (
            <>
              <ActionLoad dispatch={dispatch} />
              <ActionSave dispatch={dispatch} />
            </>
        );
    }
}


export const mapStateToProps = function(state) {
    return {};
};

export default connect(mapStateToProps)(BasePlaygroundSaveLoadWidget);
