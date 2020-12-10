
import React from 'react';
import exact from 'prop-types-exact';

import {
    PlaygroundPageNav, PlaygroundRepository} from '../shared';


export default class Footer extends React.PureComponent {
    static propTypes = exact({});

    get navs () {
        return [
            [7, ''],
            [5, <PlaygroundRepository />]];
    }

    render () {
        return (
            <PlaygroundPageNav
              tag="footer"
              className="border-top text-right"
              navs={this.navs} />
        );
    }
}
