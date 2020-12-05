import React from 'react';
import exact from 'prop-types-exact';

import {PlaygroundContext} from '../app/context';

import {NetworkResources} from '../network';
import {ProxyResources} from '../proxy';


export default class Left extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({});

    render () {
        const {modals} = this.context;
        return (
	    <div className="App-left">
              <ProxyResources
                modals={modals} />
              <NetworkResources
                modals={modals} />
            </div>);
    }
}
