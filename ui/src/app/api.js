
import {
    updateForm, updateUI, removeProxy, clearForm,
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
        const {loadUI, store} = this.playground;
        const {dispatch} = store;
        const form = store.getState().form.value;
        const {name: formName} = form;
        const {id, name, port_mappings, image, status, logs} = data;
        const proxies = {};
        if (status === "volume_create") {
            proxies[name] = {name};
            await dispatch(updateProxies({proxies}));
            loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "start") {
            proxies[name] = {name, id, image};
            if (port_mappings) {
                proxies[name].port_mappings = port_mappings;
            }
            await dispatch(updateProxies({proxies}));
            loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "exited") {
            await dispatch(removeProxy(data.id));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "destroy") {
            await dispatch(removeProxy(data.id));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "die") {
            await dispatch(removeProxy(data.id));
            await loadUI();
            if (formName && formName === data.name) {
                await dispatch(updateForm({status, logs}));
            }
        }
    };

    handleService = async (data) => {
        const {loadUI, store} = this.playground;
        const {dispatch} = store;
        const form = store.getState().form.value;
        const {service_type, name: formName} = form;
        const {id, name, image, status, logs} = data;
        const services = {};
        if (status === "volume_create") {
            services[name] = {name, service_type};
            await dispatch(updateServices({services}));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "start") {
            services[name] = {name, id, image, service_type};
            await dispatch(updateServices({services}));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "exited") {
            await dispatch(removeService(data.id));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "destroy") {
            await dispatch(removeService(data.id));
            await loadUI();
            if (formName && formName === name) {
                await dispatch(updateForm({status}));
            }
        } else if (data.status === "die") {
            await dispatch(removeService(data.id));
            await loadUI();
            if (formName && formName === data.name) {
                await dispatch(updateForm({status, logs}));
            }
        }
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
}
