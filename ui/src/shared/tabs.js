import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import classnames from 'classnames';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import {AlertValidation} from './alerts';


export class PlaygroundTabs extends React.Component {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
    });

    state = {tab: 0}

    toggle = (tab) => {
        this.setState({tab});
    }

    render () {
        let {tab} = this.state;
        const {tabs} = this.props;
        return (
            <>
              <Nav tabs>
                {Object.keys(tabs).map((k, index) => {
                    return (
                        <NavItem key={index}>
                          <NavLink
                            className={classnames({'ml-2': true, active: tab  === index})}
                            onClick={() => { this.toggle(index); }}>
                            {k}
                          </NavLink>
                        </NavItem>);
                })}
              </Nav>
	      <TabContent activeTab={tab}>
                {Object.values(tabs).map((v, index) => {
                    return (
                        <TabPane key={index} tabId={index}>
                          {v}
                        </TabPane>);
                })}
              </TabContent>
            </>);
    }
}


export class PlaygroundFormTabs extends React.PureComponent {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
        validation: PropTypes.object,
    });

    render () {
        const {tabs, validation} = this.props;
        return (
            <>
              <AlertValidation
                validation={validation} />
              <PlaygroundTabs
                tabs={tabs} />
            </>);
    }
}
