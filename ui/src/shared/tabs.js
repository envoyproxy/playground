import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import classnames from 'classnames';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import {updateUI} from '../app/store';
import {AlertValidation} from './alerts';


export class BasePlaygroundTabs extends React.PureComponent {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
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
              <Nav tabs>
                {Object.keys(tabs).map((k, index) => {
                    return (
                        <NavItem key={index}>
                          <NavLink
                            href="#"
                            className={classnames({'ml-2': true, active: (tab || 0)  === index})}
                            onClick={() => { this.toggle(index); }}>
                            {k}
                          </NavLink>
                        </NavItem>);
                })}
              </Nav>
	      <TabContent activeTab={tab || 0}>
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


const mapStateToProps = function(state, other) {
    return {
        ui: state.ui.value,
    };
};

const PlaygroundTabs = connect(mapStateToProps)(BasePlaygroundTabs);
export {PlaygroundTabs};



export class PlaygroundFormTabs extends React.PureComponent {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        validation: PropTypes.object,
    });

    render () {
        const {name, tabs, validation} = this.props;
        return (
            <>
              <AlertValidation
                validation={validation} />
              <PlaygroundTabs
                name={name}
                tabs={tabs} />
            </>);
    }
}
