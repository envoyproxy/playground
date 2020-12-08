
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {LazyLog} from 'react-lazylog';


export class PlaygroundLazyLog  extends React.PureComponent {
    static propTypes = {
        logs: PropTypes.array.isRequired,
        className: PropTypes.string,
        lineEnding: PropTypes.string,
    };

    render () {
        const {
            highlight=[],
            extraLines=2,
            className='playground-lazy-log',
            lineEnding='',
            logs, ...props} = this.props;
        if (logs.length === 0) {
            return '';
        }
        return (
            <div className={className}>
              <LazyLog
                extraLines={extraLines}
                scrollToLine={(highlight[1] || logs.length) + 4}
                highlight={highlight}
                text={logs.join(lineEnding)}
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
            } else if (highlightStart && !highlightStop) {
                highlightStop = i - 1;
            }
            i += 1;
        }
        if (highlightStart) {
            return [highlightStart,  highlightStop || logs.length];
        }
        return [];
    }

    render () {
        const {logs} = this.props;
        return (
            <PlaygroundLazyLog
              enableSearch
              highlight={this.getHighlight()}
              logs={logs} />);
    }
}
