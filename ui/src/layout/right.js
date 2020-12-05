import React from 'react';
import exact from 'prop-types-exact';

import {PlaygroundContext} from '../app/context';
import {ServiceResources} from '../service';


export default class Right extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({});

    render () {
        const {modals} = this.context;
        return (
            <div className="App-right">
              <ServiceResources
                modals={modals} />
            </div>);
    }
}
