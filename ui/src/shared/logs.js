
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundEditor} from './editor';


export class PlaygroundFailLogs extends React.PureComponent {
    static propTypes = exact({
        logs: PropTypes.array.isRequired,
    });

    render () {
        const {logs} = this.props;
        return (
            <>
              <PlaygroundEditor
                title="Logs"
                name="logs"
                content={logs.join('')}
                format="yaml"
                onChange={code => code}
              />
            </>);
    }
}
