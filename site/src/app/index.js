
import React from 'react';

import logo from './logo.svg';
import './App.css';


export default class PlaygroundSiteApp extends React.PureComponent {

    render () {
        return (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
              </header>
            </div>
        );
    }
}
