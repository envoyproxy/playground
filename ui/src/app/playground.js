
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

    load = async () => {
        await this.loadData(await this.api.get("/resources"));
    };

    loadData = async (data) => {
        await this.loadResources(data);
        await this.loadUI(data);
    };

    loadResources = async (data) => {
        const {meta} = data;
        const {dispatch, getState} = this.store;
        const initialUpdates = [
            updateMeta(meta),
            updateServiceTypes(data),
            loadServices(data),
            loadProxies(data),
            loadNetworks(data),
            updateExamples(data)];
        for (const update of initialUpdates) {
            await dispatch(update);
        }
    };

    loadUI = async (data) => {
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
