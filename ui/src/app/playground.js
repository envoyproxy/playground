
import PlaygroundAPI from './api';
import PlaygroundSocket from './socket';
import {
    updateMeta, loadNetworks,
    loadProxies, loadServices,
    updateServiceTypes, updateCloud, updateEdges, updateExamples,
} from "./store";


export default class Playground {

    constructor (store, apiAddress, socketAddress) {
        this.store = store;
        this.apiAddress = apiAddress;
        this.socketAddress = socketAddress;
        this.init();
    }

    init () {
        this.api = new PlaygroundAPI(this.apiAddress);
        this.socket = new PlaygroundSocket(this, this.socketAddress);
        this.modals = {};
        this.toast = {};
    };

    get updaters () {
        return [
            updateMeta,
            updateServiceTypes,
            loadServices,
            loadProxies,
            loadNetworks,
            updateExamples];
    }

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
