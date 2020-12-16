
import PlaygroundAPI from './api';
import PlaygroundSocket from './socket';
import {PlaygroundURLs} from './utils';
import {
    updateMeta, loadNetworks,
    loadProxies, loadServices,
    updateServiceTypes, updateCloud, updateEdges, updateExamples,
} from "./store";


export class CloudItem {

    constructor (store, name, position) {
        this.store = store;
        this.name = name;
        this.position = position;
    }

    move = async (x, y) => {
        const {dispatch} = this.store;
        const state = this.store.getState();
        const {value: networks} = state.network;
        const {value: proxies} = state.proxy;
        const {value: services} = state.service;
        const resources = {};
        resources[this.name] = [x, y];
        await dispatch(updateCloud({networks, proxies, services, resources}));
    }
}


export default class Playground {
    _updaters = [
        updateMeta,
        updateServiceTypes,
        loadServices,
        loadProxies,
        loadNetworks,
        updateExamples];

    constructor (store, apiAddress, socketAddress) {
        this.store = store;
        this.apiAddress = apiAddress;
        this.socketAddress = socketAddress;
        this.init();
    }

    init () {
        this.api = new PlaygroundAPI(this, this.apiAddress);
        this.socket = new PlaygroundSocket(this, this.socketAddress);
        this.urls = new PlaygroundURLs();
        this.modals = {};
        this.toast = {};
    };

    get updaters () {
        return this._updaters;
    }

    cloud = async (path) => {
        const {value: ui} = this.store.getState().ui;
        if (ui.resources[path]) {
            return new CloudItem(this.store, path, ui.resources[path]);
        }
        return undefined;
    };

    load = async () => {
        await this.loadData(await this.api.get("/resources"));
    };

    loadData = async (data) => {
        await this.loadResources(data);
        await this.loadUI(data);
    };

    loadResources = async (data) => {
        const {dispatch} = this.store;
        for (const update of this.updaters) {
            await dispatch(update(data));
        }
    };

    loadUI = async () => {
        const {dispatch, getState} = this.store;
        const {network, proxy, service} = getState();
        await dispatch(
            updateCloud({
                networks: network.value,
                proxies: proxy.value,
                services: service.value}));
        await dispatch(
            updateEdges({
                proxies: proxy.value}));
    }
}
