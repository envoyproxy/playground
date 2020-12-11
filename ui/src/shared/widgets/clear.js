
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {ActionClear} from '../actions';
import {PlaygroundContext} from '../../app';


export class BasePlaygroundClearWidget extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
    });

    render () {
        const {api} = this.context;
        return (
            <>
              <ActionClear
                action={api.clear} />
            </>
        );
    }
}


export const mapStateToProps = function(state) {
    return {};
};

export default connect(mapStateToProps)(BasePlaygroundClearWidget);
