import React from 'react';
import PropTypes from 'prop-types';

import {Alert} from 'reactstrap';

import {GithubSnippet} from './snippets';


export class AlertNotImplemented extends React.PureComponent {
    static propTypes = {
        exporter: PropTypes.func.isRequired,
    };

    render () {
        const {exporter, ...props} = this.props;
        return (
            <Alert
              {...props}
              color="warning">
              <div className="row p-2 pt-0">
                Unfortunately this feature is not yet implemented.
              </div>
              <div className="row p-2">
                Perhaps you could help.
              </div>
              <div className="row p-2">
                Contributions welcome.
              </div>
              <div className="row p-3 m-1 mb-3 bg-light">
                  <GithubSnippet />
              </div>
            </Alert>);
    }
}
