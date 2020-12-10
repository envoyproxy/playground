
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    PlaygroundPageNav, PlaygroundLogotype,
    PlaygroundClearWidget,
    PlaygroundSaveLoadWidget} from '../shared';


export default class Header extends React.PureComponent {
    static propTypes = exact({});

    get navs () {
        const {dispatch, title, version} = this.props;
        return [
            [8, <PlaygroundLogotype />],
            [3, <PlaygroundSaveLoadWidget />],
            [1, <PlaygroundClearWidget />]];
    }

    render () {
        return (
            <PlaygroundPageNav
              tag="header"
              navs={this.navs} />
        );
    }
}
