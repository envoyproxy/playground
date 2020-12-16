
import React from 'react';

import exact from 'prop-types-exact';

import {PlaygroundSiteHome} from '../home';
import PlaygroundSiteHeader from './header';


export default class PlaygroundPage extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
            <div className="App container-fluid">
              <header className="App-header row">
                <PlaygroundSiteHeader />
              </header>
              <main className="App-main row">
                <PlaygroundSiteHome />
              </main>
            </div>);
    }
}
