
import React from 'react';
import exact from 'prop-types-exact';

import {Col, Nav, NavItem, NavLink} from 'reactstrap';

import {PlaygroundRepository} from '../shared';
import {PlaygroundPageNav} from '../shared/nav';


export default class Footer extends React.PureComponent {
    static propTypes = exact({});

    get navs () {
        const {dispatch, title, version} = this.props;
        return [
            [9, ''],
            [3, <PlaygroundRepository />]];
    }

    render () {
        return (
            <PlaygroundPageNav
              tag="footer"
              navs={this.navs} />
        );
    }
}
