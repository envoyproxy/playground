
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {LazyLog} from 'react-lazylog';

import {PlaygroundEditor} from './editor';


export class PlaygroundFailLogs extends React.PureComponent {
    static propTypes = exact({
        logs: PropTypes.array.isRequired,
    });

    render () {
        const {logs} = this.props;
        let i = 1;
        let highlightStart;
        let highlightStop;
        let highlight;
        for (const line of logs) {
            if (line.toLowerCase().indexOf('error') !== -1 || line.toLowerCase().indexOf('invalid') !== -1) {
                if (!highlightStart) {
                    highlightStart = i;
                } else {
                    highlightStop = i;
                }
            } else {
                if (highlightStart) {
                    if (!highlightStop) {
                        highlightStop = i;
                    }
                }
            }
            i += 1;
        }
        if (highlightStart) {
            highlight = [highlightStart,  highlightStop || logs.length + 1];
        }
        return (
            <div style={{ height: '50vh', width: '100%' }}>
              <LazyLog
                enableSearch
                extraLines={2}
                scrollToLine={highlightStop + 2 || logs.length + 1}
                highlight={highlight}
                text={logs.join('')} />
            </div>);
    }
}
