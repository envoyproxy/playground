
import API, {PlaygroundSocket} from './api';
import {
    updateMeta, loadNetworks,
    loadProxies, loadServices,
    updateServiceTypes, updateCloud, updateEdges, updateExamples,
} from "./store";


export class Playground {

    constructor (store, apiAddress, socketAddress) {
        this.store = store;
        this.api = new API(apiAddress);
        this.socket = new PlaygroundSocket(this, socketAddress);
        this.modals = {};
        this.toast = {};
    }

    load = async () => {
        await this.loadData(await this.api.get("/resources"));
    }

    loadData = async (data) => {
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
        await this.store.dispatch(
            updateCloud({
                networks: network.value,
                proxies: proxy.value,
                services: service.value}));
        await this.store.dispatch(
            updateEdges({
                proxies: proxy.value}));
    }
}
