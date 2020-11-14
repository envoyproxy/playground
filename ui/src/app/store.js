import {combineReducers} from 'redux';
import {createSlice, configureStore} from '@reduxjs/toolkit';

import {staticAddress} from '../app/constants';


const metaSlice = createSlice({
    name: 'meta',
    initialState: {
        value: {}
    },
    reducers: {
        updateMeta: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
    }
});

export const {updateMeta} = metaSlice.actions;


const UISlice = createSlice({
    name: 'ui',
    initialState: {
        value: {modal: null}
    },
    reducers: {
        updateUI: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
    }
});

export const {updateUI} = UISlice.actions;


const proxySlice = createSlice({
    name: 'proxy',
    initialState: {
        value: {}
    },
    reducers: {
        updateProxies: (state, action) => {
            const proxies = {...action.payload.proxies};
            Object.entries(action.payload.networks || {}).forEach(([k, v], index) => {
                (v.proxies || []).forEach(proxy => {
                    proxies[proxy].networks = proxies[proxy].networks || [];
                    proxies[proxy].networks.push(k);
                });
            });
            state.value = {...state.value, ...action.payload.proxies};
        },
        removeProxy: (state, action) => {
            Object.entries(state.value).forEach(([k, v]) => {
                if (v.id === action.payload) {
                    delete state.value[k];
                }
            });
        }
    }
});

export const {updateProxies, removeProxy} = proxySlice.actions;


const networkSlice = createSlice({
    name: 'network',
    initialState: {
        value: {}
    },
    reducers: {
        updateNetworks: (state, action) => {
            const _networks = {};
            for (const [k, v] of Object.entries(action.payload.networks)) {
                const {containers=[], ...network} = v;
                _networks[k] = network;
                _networks[k].services = [];
                _networks[k].proxies = [];
                for (const container of containers) {
                    for (const service of Object.values(action.payload.services)) {
                        if (service["id"] === container) {
                            _networks[k].services.push(service["name"]);
                            break;
                        }
                    }
                    for (const proxy of Object.values(action.payload.proxies)) {
                        if (proxy["id"] === container) {
                            _networks[k].proxies.push(proxy["name"]);
                            break;
                        }
                    }
                }
            }
            state.value = {...state.value, ..._networks};
        },
        removeNetwork: (state, action) => {
            Object.entries(state.value).forEach(([k, v]) => {
                if (v.id === action.payload) {
                    delete state.value[k];
                }
            });
        },
    }
});

export const {removeNetwork, updateNetworks} = networkSlice.actions;

const serviceSlice = createSlice({
    name: 'service',
    initialState: {
        value: {}
    },
    reducers: {
        updateServices: (state, action) => {
            const services = {...action.payload.services};
            state.value = {...state.value, ...services};
        },
        removeService: (state, action) => {
            Object.entries(state.value).forEach(([k, v]) => {
                if (v.id === action.payload) {
                    delete state.value[k];
                }
            });
        }
    }
});

export const {removeService, updateServices} = serviceSlice.actions;

const serviceTypeSlice = createSlice({
    name: 'service_type',
    initialState: {
        value: {}
    },
    reducers: {
        updateServiceTypes: (state, action) => {
            const service_types = {};
            for (const [k, v] of Object.entries(action.payload.service_types)) {
                service_types[k] = v;
                service_types[k].icon = staticAddress + "/static/" + k + "/" + v["labels"]["envoy.playground.logo"];
                service_types[k].title = v["labels"]["envoy.playground.service"];
            }
            state.value = {...state.value, ...service_types};
        },
    }
});

export const {updateServiceTypes} = serviceTypeSlice.actions;


const formSlice = createSlice({
    name: 'form',
    initialState: {
        value: {}
    },
    reducers: {
        updateForm: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
        clearForm: (state, action) => {
            state.value = {};
        },
    }
});

export const {updateForm, clearForm} = formSlice.actions;


const rootReducer = combineReducers({
    proxy: proxySlice.reducer,
    network: networkSlice.reducer,
    service:  serviceSlice.reducer,
    service_type:  serviceTypeSlice.reducer,
    meta: metaSlice.reducer,
    form: formSlice.reducer,
    ui: UISlice.reducer});

const store = configureStore({
    reducer: rootReducer,
});

export default store;
