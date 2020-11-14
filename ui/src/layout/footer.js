import React from 'react';
import exact from 'prop-types-exact';

import {GithubSnippet} from '../shared/snippets';


export default class Footer extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
            <div className="App-footer bg-dark text-light p-0 m-0 pr-3 border-top border-dark row small">
              <div className="col sm-6">
                © GPL v3.0
              </div>
              <div className="col sm-6 text-right">
                <GithubSnippet />
              </div>
            </div>);
    }
}
