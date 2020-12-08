
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {LazyLog} from 'react-lazylog';


export class PlaygroundLazyLog  extends React.PureComponent {

    render () {
        const {
            highlight=[],
            extraLines=2,
            logs, ...props} = this.props;
        if (!logs) {
            return '';
        }
        return (
            <div className="playground-lazy-log">
              <LazyLog
                enableSearch
                extraLines={extraLines}
                scrollToLine={(highlight[1] || logs.length) + 2}
                highlight={highlight}
                text={logs.join('')}
                {...props}
              />
            </div>);
    }
}


export class PlaygroundFailLogs extends React.PureComponent {
    static propTypes = exact({
        logs: PropTypes.array.isRequired,
    });

    isError = (line) => {
        const _line = line.toLowerCase();
        return (
            _line.indexOf('error') !== -1
                || _line.indexOf('invalid') !== -1);
    }

    getHighlight = () => {
        const {logs} = this.props;
        let i = 1;
        let highlightStart;
        let highlightStop;
        for (const line of logs) {
            if (this.isError(line)) {
                if (!highlightStart) {
                    highlightStart = i;
                } else {
                    highlightStop = i;
                }
            }
            i += 1;
        }
        if (highlightStart) {
            return [highlightStart,  highlightStop || logs.length + 1];
        }
        return [];
    }

    render () {
        const {logs} = this.props;
        return (
              <PlaygroundLazyLog
                highlight={this.getHighlight()}
                logs={logs} />);
    }
}
