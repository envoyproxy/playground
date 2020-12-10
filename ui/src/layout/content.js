import React from 'react';
import exact from 'prop-types-exact';

import {PlaygroundTabs} from '../shared/tabs';
import CloudContent from '../cloud';
import EdgesContent from '../edges';


export default class Content extends React.PureComponent {
    static propTypes = exact({})

    get tabs () {
        let tabs = {
            Cloud: <CloudContent />,
            Edges: <EdgesContent />,
        };
        return tabs;
    }

    render () {
        return (
            <PlaygroundTabs
              tabs={this.tabs}
              name="content" />);
    }
}
