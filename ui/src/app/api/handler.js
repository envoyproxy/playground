
import {
    updateForm, removeProxy,
    updateProxies, removeNetwork, updateNetworks,
    removeService, updateServices,
} from "../../app/store";


export class PlaygroundAPIResources {

    constructor (api) {
        const {playground} = api;
        this.api = api;
        this.playground = playground;
    }
}


export class PlaygroundAPIImages extends PlaygroundAPIResources {

    handle = async (data) => {
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
}


export class PlaygroundAPINetworks extends PlaygroundAPIResources {

    handle = async (data) => {
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
}


export class PlaygroundAPIContainers extends PlaygroundAPIResources {

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

    _handle = async (data, onUpdate, onRemove) => {
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
}


export class PlaygroundAPIServices extends PlaygroundAPIContainers {

    handle = async (data) => {
        const {image, name, service_type} = data;
        const _updateServices = (services) => {
            services[name].service_type = service_type;
            services[name].image = image;
            return updateServices({services});
        };
        await this._handle(data, _updateServices, removeService);
    }
}


export class PlaygroundAPIProxies extends PlaygroundAPIContainers {

    handle = async (data) => {
        const {name, port_mappings} = data;
        const _updateProxies = (proxies) => {
            proxies[name].port_mappings = port_mappings;
            return updateProxies({proxies});
        };
        await this._handle(data, _updateProxies, removeProxy);
    }
}
