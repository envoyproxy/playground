
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {ActionClear} from '../actions';


export class BasePlaygroundClearWidget extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
    });

    render () {
        const {dispatch} = this.props;
        return (
            <>
              <ActionClear dispatch={dispatch} />
            </>
        );
    }
}



export const mapStateToProps = function(state) {
    return {};
};

export default connect(mapStateToProps)(BasePlaygroundClearWidget);
