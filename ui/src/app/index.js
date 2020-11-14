import React from 'react';
import {Provider} from 'react-redux';

import Layout from '../layout';
import {ModalContext, APIContext} from "./context";
import store, {
    updateMeta, updateServices, updateProxies, updateNetworks,
    updateServiceTypes
} from "./store";

/* css */
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/prism.css';
import '../css/app.css';
import API, {PlaygroundSocket} from './api';

import {apiAddress, socketAddress} from './constants';

const api = new API(apiAddress);


export default class App extends React.PureComponent {

    async componentDidMount () {
        new PlaygroundSocket(socketAddress, store);
        const data = await api.get("/resources");
        const initialUpdates = [
            updateMeta({version: data.version}),
            updateServiceTypes(data),
            updateServices(data),
            updateProxies(data),
            updateNetworks(data)];
        for (const update of initialUpdates) {
            store.dispatch(update);
        }
    }

    render () {
        return (
            <Provider store={store}>
              <APIContext.Provider value={api}>
                <ModalContext.Provider value={{}}>
                  <Layout />
                </ModalContext.Provider>
              </APIContext.Provider>
            </Provider>
        );
    }
}
