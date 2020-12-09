
import {
    clearForm,  logEvent,  updateForm, removeProxy,
    updateProxies, removeNetwork, updateNetworks,
    removeService, updateServices, updateUI,
} from "../../app/store";


export class PlaygroundAPIResources {

    constructor (api) {
        const {playground} = api;
        const {store} = playground;
        this.api = api;
        this.playground = playground;
        this.store = store;
    }

    getResources = () => {
        const {getState} = this.store;
        const state = getState();
        return state[this.apiType].value;
    }

    _getName = (id) => {
        return Object.values(this.getResources()).filter(v => v.id === id)[0].name;
    };

    add = async () => {
        const {dispatch} = this.store;
        await dispatch(clearForm());
        await dispatch(updateUI({modal: this.apiType}));
    };

    call = async (command, payload) => {
        const {dispatch} = this.store;
        const {errors} = await this.api.post('/' + this.apiType + '/' + command, payload);
        if (errors) {
            await dispatch(updateForm({validation: errors, status: ''}));
        }
    };

    create = async () => {
        const {dispatch, getState} = this.store;
        const state = getState();
        const {value: form} = state.form;
        const {
            errors: _errors, env, logs,
            valid, validation, status, vars, warning, ...data} = form;
        // this is wrong for networks
        data.env = env || vars;
        await dispatch(updateForm({status: 'initializing'}));
        await this.log('create', data);
        await this.call('add', data);
    };

    log = async (event, data) => {
        return await this._log(event, data);
    };

    delete = async (id) => {
        await this.log('delete', id);
        await this.call('delete', {id});
    }

    edit = async (name) => {
        const {dispatch} = this.store;
        dispatch(updateForm({...this.getResources()[name], edit: true}));
        dispatch(updateUI({modal: this.apiType}));
    }

    update = async (data) => {
        const {name, status, ...update} = data;
        await this.call('edit', update);
    }

    _log = async (event, data) => {
        const {dispatch} = this.store;
        if (event === 'create') {
            await dispatch(logEvent({status: 'create', name: data.name, type: this.apiType}));
        } else if (event === 'delete') {
            const name = this._getName(data);
            await dispatch(logEvent({
                status: 'remove',
                action: 'remove',
                name,
                type: this.apiType}));
        }
    };
}


export class PlaygroundAPIImages extends PlaygroundAPIResources {
    apiType = 'image'

    handle = async (data) => {
        const {dispatch} = this.store;
        const state = this.store.getState();
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
    apiType = 'network'

    log = async (event, data) => {
        const {dispatch} = this.store;
        if (event === 'create') {
            const update = {action: 'init', name: data.name, type: this.apiType};
            await dispatch(logEvent(update));
        } else {
            await this._log(event, data);
        }
    };

    handle = async (data) => {
        const {loadUI} = this.playground;
        const {dispatch} = this.store;
        if (data.action === "destroy") {
            await dispatch(removeNetwork(data.id));
        } else if (data.action === "create") {
            const {action: status} = data;
            await dispatch(updateNetworks(data));
            await dispatch(updateForm({status}));
        } else if (data.action === "connect" || data.action === "disconnect") {
            const {service, proxy} = this.store.getState();
            await dispatch(updateNetworks({
                services: service.value,
                proxies: proxy.value,
                ...data}));
        }
        await loadUI();
    };
}


export class PlaygroundAPIContainers extends PlaygroundAPIResources {

    _updateContainerForm = async (name, status, logs) => {
        const {loadUI} = this.playground;
        const {dispatch} = this.store;
        const form = this.store.getState().form.value;
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
        const {dispatch} = this.store;
        const {id, name, status, logs} = data;
        let _dispatch;
        if (['volume_create', 'start'].indexOf(status) !== -1) {
            const update = {};
            update[name] = {id, name};
            _dispatch = onUpdate(update);
        } else if (['exited', 'destroy', 'die'].indexOf(status) !== -1) {
            _dispatch = onRemove(data.id);
        }
        await dispatch(_dispatch);
        await this._updateContainerForm(name, status, logs);
    }
}


export class PlaygroundAPIServices extends PlaygroundAPIContainers {
    apiType = 'service'

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
    apiType = 'proxy'

    handle = async (data) => {
        const {image, name, port_mappings} = data;
        const _updateProxies = (proxies) => {
            proxies[name].port_mappings = port_mappings;
            if (image) {
                proxies[name].image = image;
            }
            return updateProxies({proxies});
        };
        await this._handle(data, _updateProxies, removeProxy);
    }
}
