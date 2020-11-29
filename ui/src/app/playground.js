import React from 'react';
import {Provider} from 'react-redux';

import Layout from '../layout';
import {ModalContext, APIContext} from "./context";
import store, {
    updateMeta, updateServices, updateProxies, updateNetworks,
    updateServiceTypes, updateCloud, updateEdges
} from "./store";

/* css */
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/prism.css';
import './css/app.css';
import API, {PlaygroundSocket} from './api';

import {apiAddress, socketAddress} from './constants';

const api = new API(apiAddress);


export default class PlaygroundApp extends React.PureComponent {

    async componentDidMount () {
        new PlaygroundSocket(socketAddress, store);
        const data = await api.get("/resources");
        const {meta} = data;
        const initialUpdates = [
            updateMeta(meta),
            updateServiceTypes(data),
            updateServices(data),
            updateProxies(data),
            updateNetworks(data)];
        for (const update of initialUpdates) {
            await store.dispatch(update);
        }
        const {network, proxy, service} = store.getState();
        await store.dispatch(updateCloud({networks: network.value, proxies: proxy.value, services: service.value}));
        await store.dispatch(updateEdges({proxies: proxy.value}));
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
