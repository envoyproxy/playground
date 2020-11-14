import React from 'react';
import exact from 'prop-types-exact';

import {ModalContext} from '../app/context';
import {ServiceResources} from '../service';


export default class Right extends React.PureComponent {
    static contextType = ModalContext;
    static propTypes = exact({});

    render () {
        return (
            <div className="App-right">
              <ServiceResources
                modals={this.context} />
            </div>);
    }
}
