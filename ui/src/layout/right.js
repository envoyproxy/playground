import React from 'react';
import exact from 'prop-types-exact';

import {ServiceResources} from '../service';
import {PlaygroundEventLogging} from '../event';


export default class Right extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
            <>
              <ServiceResources />
              <PlaygroundEventLogging />
            </>);
    }
}
