
import React from 'react';
import exact from 'prop-types-exact';

import {ActionClear} from '../actions';
import {PlaygroundContext} from '../../app/context';


export default class PlaygroundClearWidget extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({});

    render () {
        const {api} = this.context;
        return (
            <ActionClear
                action={api.clear} />
        );
    }
}
