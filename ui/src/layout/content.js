import React from 'react';
import exact from 'prop-types-exact';

import {PlaygroundTabs} from '../shared/tabs';
import CloudContent from '../cloud';
import EdgesContent from '../edges';


export default class Content extends React.PureComponent {
    static propTypes = exact({})

    get tabs () {
        return {
            Cloud: <CloudContent />,
            Edges: <EdgesContent />,
        };
    }

    render () {
        return (
            <PlaygroundTabs
              tabs={this.tabs}
              name="content" />);
    }
}
