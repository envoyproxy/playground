
import React from 'react';
import exact from 'prop-types-exact';

import {Provider} from 'react-redux';

import {ShortcutProvider} from 'react-keybind';

import PlaygroundAPI from './api';
import {apiAddress, socketAddress} from './constants';
import {PlaygroundContext} from "./context";
import {Page} from '../layout';
import Playground from './playground';
import PlaygroundSocket from  './socket';
import store from "./store";

/* css */
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/prism.css';
import './css/app.css';


export class PlaygroundApp extends React.Component {
    static propTypes = exact({});

    state = {playground: ''}

    async componentDidMount () {
        const playground = new Playground(store, apiAddress, socketAddress);
        await playground.load();
        this.setState({playground});
    }

    render () {
        const {playground} = this.state;
        if (playground.length === 0) {
            return '';
        }
        return (
            <ShortcutProvider>
              <Provider store={store}>
                <PlaygroundContext.Provider value={playground}>
                  <div className="App">
                    <Page />
                  </div>
                </PlaygroundContext.Provider>
              </Provider>
            </ShortcutProvider>
        );
    }
}

export {
    apiAddress, socketAddress, store,
    Playground, PlaygroundAPI,
    PlaygroundContext, PlaygroundSocket};
