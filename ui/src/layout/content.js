import React from 'react';
import exact from 'prop-types-exact';

import classnames from 'classnames';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import {PlaygroundTabs} from '../shared/tabs';
import CloudContent from '../cloud';
import EdgesContent from '../edges';


export default class Content extends React.PureComponent {
    static propTypes = exact({})

    state = {tab: '1'}

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
        const {tab} = this.state;
        return (
            <PlaygroundTabs
              tabs={this.tabs}
              name="content" />);
    }
}
