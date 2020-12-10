
import React from 'react';
import exact from 'prop-types-exact';

import {
    PlaygroundPageNav, PlaygroundLogotype,
    PlaygroundClearWidget,
    PlaygroundSaveLoadWidget} from '../shared';


export default class Header extends React.PureComponent {
    static propTypes = exact({});

    get navs () {
        return [
            [8, <PlaygroundLogotype />],
            [3, <PlaygroundSaveLoadWidget />],
            [1, <PlaygroundClearWidget />]];
    }

    render () {
        return (
            <PlaygroundPageNav
              tag="header"
              className="border-bottom border-dark"
              navs={this.navs} />
        );
    }
}
