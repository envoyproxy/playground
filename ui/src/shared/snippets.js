import React from 'react';
import exact from 'prop-types-exact';

import GithubLogo from '../images/github.svg';


export class GithubSnippet extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
            <>
              <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" />
	      <a href="https://github.com/envoyproxy/playground">https://github.com/envoyproxy/playground</a>
            </>);
    }
}
