
import React from 'react';

import logo from '../app/images/logo.svg';


export default class PlaygroundPage extends React.PureComponent {

    render () {
        return (
            <div className="App">
              <header className="App-header">
		HEADER
              </header>
              <main className="App-main">
                <img src={logo} className="App-logo" alt="logo" />
              </main>
            </div>);
    }
}
