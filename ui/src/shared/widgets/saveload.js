
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {ActionSave, ActionLoad} from '../actions';
import {updateUI} from '../../app/store';


export class BasePlaygroundSaveLoadWidget extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
    });

    save = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    load = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    render () {
        return (
            <>
              <ActionLoad action={this.load} />
              <ActionSave action={this.save} />
            </>
        );
    }
}


export const mapStateToProps = function(state) {
    return {};
};

export default connect(mapStateToProps)(BasePlaygroundSaveLoadWidget);
