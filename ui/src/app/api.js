
import {
    updateForm, updateUI, removeProxy,
    updateProxies, removeNetwork, updateNetworks,
    removeService, updateServices,
} from "../app/store";


export default class PlaygroundAPI {
    _handlers = {
        image: 'handleImage',
        network: 'handleNetwork',
        proxy: 'handleProxy',
        service: 'handleService'};

    constructor (playground, address) {
        this.address = address;
        this.playground = playground;
    }

    get handlers () {
        return this._handlers;
    }

    async get (path) {
        const response = await fetch(this._getAddress(path));
        return await response.json();
    }

    handleErrors = async (data) => {
        const {store} = this.playground;
        const {dispatch} = store;
        await dispatch(updateUI({
            toast: 'errors',
            errors: data.playtime_errors}));
    }

    handleImage = async (data) => {
        const {store} = this.playground;
        const {dispatch} = store;
        const state = store.getState();
        const form = state.form.value;
        const service_types = state.service_type.value;
        if (Object.keys(form).length === 0) {
            return;
        }
        const {service_type} = form;
        if (service_type) {
            const serviceConfig = service_types[service_type];
            const {image} = serviceConfig;
            const {status} = data;
            if (image === data.image) {
                await(dispatch(updateForm({status})));
            }
        } else {
            const {image, status} = data;
            if (image === "envoyproxy/envoy-dev-playground:latest") {
                await(dispatch(updateForm({status})));
            }
        }
    }

    handleNetwork = async (data) => {
        const {loadUI, store} = this.playground;
        const {dispatch} = store;
        if (data.action === "destroy") {
            await dispatch(removeNetwork(data.id));
            loadUI();
        } else if (data.action === "create") {
            const {action: status} = data;
            await dispatch(updateNetworks(data));
            await dispatch(updateForm({status}));
            loadUI();
        } else if (data.action === "connect" || data.action === "disconnect") {
            const {service, proxy} = store.getState();
            await dispatch(updateNetworks({
                services: service.value,
                proxies: proxy.value,
                ...data}));
            await loadUI();
        }
    };

    handleProxy = async (data) => {
        const {name, port_mappings} = data;
        const _updateProxies = (proxies) => {
            proxies[name].port_mappings = port_mappings;
            return updateProxies({proxies});
        };
        await this._handleContainer(data, _updateProxies, removeProxy);
    }

    handleService = async (data) => {
        const {image, name, service_type} = data;
        const _updateServices = (services) => {
            services[name].service_type = service_type;
            services[name].image = image;
            return updateServices({services});
        };
        await this._handleContainer(data, _updateServices, removeService);
    }

    async post (path, payload) {
        const response = await fetch(
            this._getAddress(path),
            this._getPostPayload(payload));
        return await response.json();
    }

    _getAddress = (path) => {
        return this.address + path;
    };

    _getPostPayload = (payload) => {
        return {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };
    };

    _handleContainer = async (data, onUpdate, onRemove) => {
        const {store} = this.playground;
        const {dispatch} = store;
        const {id, name, status, logs} = data;

        if (['volume_create', 'start'].indexOf(status) !== -1) {
            const update = {};
            update[name] = {id, name};
            await dispatch(onUpdate(update));
            await this._update(name, status, logs);
        } else if (['exited', 'destroy', 'die'].indexOf(status) !== -1) {
            await dispatch(onRemove(data.id));
            await this._update(name, status, logs);
        }
    }

    _update = async (name, status, logs) => {
        const {loadUI, store} = this.playground;
        const {dispatch} = store;
        const form = store.getState().form.value;
        const {name: formName} = form;
        await loadUI();
        if (formName && formName === name) {
            const update = {status};
            if (status === 'die') {
                update.logs = logs;
            }
            await dispatch(updateForm(update));
        }
    };
}
