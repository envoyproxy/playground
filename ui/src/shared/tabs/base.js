import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import classnames from 'classnames';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import {updateUI} from '../../app/store';


export class PlaygroundTabNavs extends React.PureComponent {
    static propTypes = exact({
        active: PropTypes.string,
        tabs: PropTypes.array.isRequired,
    });

    render () {
        const {active, tabs} = this.props;
        return (
              <Nav tabs>
                {tabs.map((k, index) => {
                    return (
                        <NavItem key={index}>
                          <NavLink
                            href="#"
                            className={classnames({'ml-2': true, active: (active || 0)  === index})}
                            onClick={() => { this.toggle(index); }}>
                            {k}
                          </NavLink>
                        </NavItem>);
                })}
              </Nav>
        );
    }
}


export class PlaygroundTabContent extends React.PureComponent {
    static propTypes = exact({
        active: PropTypes.string,
        tabs: PropTypes.array.isRequired,
    });

    render () {
        const {active, tabs} = this.props;
        return (
	    <TabContent activeTab={active || 0}>
              {tabs.map((v, index) => {
                  return (
                      <TabPane key={index} tabId={index}>
                        {v}
                      </TabPane>);
              })}
            </TabContent>
        );
    }
}


export class BasePlaygroundTabs extends React.PureComponent {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired,
    });

    toggle = (tab) => {
        const {dispatch, name, ui} = this.props;
        const {tabs: _tabs={}} = ui;
        const tabs = {..._tabs};
        tabs[name] = tab;
        dispatch(updateUI({tabs}));
    }

    render () {
        const {name, ui} = this.props;
        const {tabs: _tabs={}} = ui;
        const tab = _tabs[name];
        const {tabs} = this.props;
        return (
            <>
              <PlaygroundTabNavs
                tabs={Object.keys(tabs)}
                active={tab}
              />
              <PlaygroundTabContent
                tabs={Object.values(tabs)}
                active={tab}
              />
            </>);
    }
}


export const mapStateToProps = function(state, other) {
    return {
        ui: state.ui.value,
    };
};

export default connect(mapStateToProps)(BasePlaygroundTabs);
