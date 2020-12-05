
import React from 'react';
import exact from 'prop-types-exact';

import {Provider} from 'react-redux';

import {apiAddress, socketAddress} from './constants';
import {PlaygroundContext} from "./context";
import {Layout} from '../layout';
import {Playground} from './playground';
import store from "./store";

/* css */
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/prism.css';
import './css/app.css';


const playground = new Playground(store, apiAddress, socketAddress);


export class PlaygroundApp extends React.PureComponent {
    static propTypes = exact({});

    async componentDidMount () {
        await playground.load();
    }

    render () {
        return (
            <Provider store={store}>
              <PlaygroundContext.Provider value={playground}>
                <Layout />
              </PlaygroundContext.Provider>
            </Provider>
        );
    }
}
