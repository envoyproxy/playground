import React from 'react';
import exact from 'prop-types-exact';

import {Provider} from 'react-redux';

import {Layout} from '../layout';
import {PlaygroundContext} from "./context";
import store, {
    updateMeta, loadNetworks,
    loadProxies, loadServices,
    updateServiceTypes, updateCloud, updateEdges, updateExamples,
} from "./store";

/* css */
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/prism.css';
import './css/app.css';
import API, {PlaygroundSocket} from './api';

import {apiAddress, socketAddress} from './constants';

export class Playground {

    constructor () {
        this.api = new API(apiAddress);
        this.socket = new PlaygroundSocket(socketAddress, store, this.api);
        this.store = store;
        this.modals = {};
        this.toast = {};
    }

    load = async () => {
        const data = await this.api.get("/resources");
        const {meta} = data;
        const initialUpdates = [
            updateMeta(meta),
            updateServiceTypes(data),
            loadServices(data),
            loadProxies(data),
            loadNetworks(data),
            updateExamples(data)];
        for (const update of initialUpdates) {
            await this.store.dispatch(update);
        }
        const {network, proxy, service} = this.store.getState();
        await this.store.dispatch(updateCloud({networks: network.value, proxies: proxy.value, services: service.value}));
        await this.store.dispatch(updateEdges({proxies: proxy.value}));
    }
}

const playground = new Playground();

export default class PlaygroundApp extends React.PureComponent {
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
