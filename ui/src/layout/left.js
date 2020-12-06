import React from 'react';
import exact from 'prop-types-exact';

import {NetworkResources} from '../network';
import {ProxyResources} from '../proxy';


export default class Left extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
	    <>
              <ProxyResources />
              <NetworkResources />
            </>);
    }
}
