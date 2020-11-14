import React from 'react';
import exact from 'prop-types-exact';

import {ModalContext} from '../app/context';

import {NetworkResources} from '../network';
import {ProxyResources} from '../proxy';


export default class Left extends React.PureComponent {
    static contextType = ModalContext;
    static propTypes = exact({});

    render () {
        return (
	    <div className="App-left">
              <ProxyResources
                modals={this.context} />
              <NetworkResources
                modals={this.context} />
            </div>);
    }
}
