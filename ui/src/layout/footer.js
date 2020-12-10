import React from 'react';
import exact from 'prop-types-exact';

import {Col} from 'reactstrap';

import {GithubSnippet} from '../shared/snippets';


export default class Footer extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
            <>
              <Col sm={6}>
              </Col>
              <Col sm={6} className="text-right">
                <GithubSnippet />
              </Col>
            </>
        );
    }
}
