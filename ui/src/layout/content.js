import React from 'react';
import exact from 'prop-types-exact';

import {PlaygroundTabs} from '../shared/tabs';
import CloudContent from '../cloud';
import EdgesContent from '../edges';


export default class Content extends React.PureComponent {
    static propTypes = exact({})

    toggle = (tab) => {
        this.setState({tab});
    }

    constructor(props) {
        super(props);
        this.parentRef = React.createRef();
    }

    get tabs () {
        let tabs = {
            Cloud: <CloudContent parentRef={this.parentRef} />,
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
