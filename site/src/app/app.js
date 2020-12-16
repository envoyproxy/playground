
import React from 'react';

import {Provider} from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/playground-site.css';

import {PlaygroundPage} from '../layout';
import {PlaygroundSiteContext} from "./context";
import PlaygroundSite from './site';

import store from "./store";


export default class PlaygroundSiteApp extends React.PureComponent {

    state = {site: null}

    async componentDidMount () {
        const site = new PlaygroundSite(store);
        await site.load();
        this.setState({site});
    }

    render () {
        const {site} = this.state;
        if (!site) {
            return '';
        }
        return (
            <Provider store={store}>
              <PlaygroundSiteContext.Provider value={site}>
                <PlaygroundPage />
              </PlaygroundSiteContext.Provider>
            </Provider>
        );
    }
}
