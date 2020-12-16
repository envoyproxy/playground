
import {updateCloud} from "./store";


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
