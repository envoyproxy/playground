import React from 'react';
import exact from 'prop-types-exact';

import classnames from 'classnames';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

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

    render () {
        const {tab} = this.state;
        return (
            <div className="App-content pt-3 pl-1 pr-1 bg-light">
              <Nav tabs>
		<NavItem>
		  <NavLink
		    className={classnames({'ml-2': true, active: tab  === '1'})}
		    onClick={() => { this.toggle('1'); }}>
                    Cloud
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({'ml-2': true, active: tab  === '2'})}
                    onClick={() => { this.toggle('2'); }}>
                    Edges
                  </NavLink>
                </NavItem>
              </Nav>

	      <TabContent activeTab={tab}>
		<TabPane tabId="1">
                  <CloudContent parentRef={this.parentRef} />
                </TabPane>
                <TabPane tabId="2">
                  <EdgesContent />
                </TabPane>
              </TabContent>
            </div>);
    }
}
