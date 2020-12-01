import {combineReducers} from 'redux';
import {createSlice, configureStore} from '@reduxjs/toolkit';

import {staticAddress} from '../app/constants';
import {getRndInteger} from '../shared/utils';


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


const getX = (resource) => {
    if (resource === 'cloud') {
        return getRndInteger(200, 400);
    } else {
        const beforeOrAfter = getRndInteger(0, 1);
        if (beforeOrAfter === 0) {
            return getRndInteger(getXyIcons()[1], 200);
        } else {
            return getRndInteger(400, getXY()[0] - getXyIcons()[0]);
        }
    }
};

const getXY = () => {
    return [600, 400];
}

const getXyIcons = () => {
    return [50, 50];
}

const getY = (resource) => {
    if (resource === 'cloud') {
        return getRndInteger(100, 300);
    } else {
        const beforeOrAfter = getRndInteger(0, 1);
        if (beforeOrAfter === 0) {
            return getRndInteger(getXyIcons()[1], 100);
        } else {
            return getRndInteger(300, getXY()[1] - getXyIcons()[1]);
        }
    }
};

const UISlice = createSlice({
    name: 'ui',
    initialState: {
        value: {modal: null}
    },

    reducers: {
        updateUI: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },

        updateEdges: (state, action) => {
            const {proxies={}} = action.payload;
            const edges = {};
            let proxiesWithEdges = new Set();
            for (const [name, proxy] of Object.entries(proxies)) {
                const {port_mappings=[]} = proxy;
                for (const mapping of port_mappings) {
                    const {mapping_from} = mapping;
                    if (mapping_from) {
                        const {mapping_to} = mapping;
                        proxiesWithEdges.add(name);
                        edges[mapping_from] = {proxy: name, internal: mapping_to};
                    }
                }
            }
            let proxiesWithEdgesCount = proxiesWithEdges.size;

            const width = 600;
            const height = 400;

            let numOfRows = 1;
            let numOfCols = proxiesWithEdgesCount;

            if (proxiesWithEdgesCount > 9) {
                numOfCols = 4;
            } else if (proxiesWithEdgesCount > 2) {
                numOfCols = 3;
            }

            numOfRows = Math.ceil(proxiesWithEdgesCount / numOfCols);
            const boxWidth = width / numOfCols;
            const boxHeight = height / numOfRows;
            let row = 0;
            let col = 0;
            for (const proxy of proxiesWithEdges) {
                let boxOffsetX = col * boxWidth;
                let boxOffsetY = row * boxHeight;
                let boxCount = 0;
                // todo: improve internal box offsets
                for (const edge of Object.values(edges)) {
                    if (edge.proxy === proxy) {
                        edge.x = boxOffsetX + (boxCount * 50) + 10;
                        edge.y = boxOffsetY + (boxCount * 50) + 10;
                        boxCount += 1;
                    }
                }
                if (col + 1 === numOfCols) {
                    col = 0;
                    row = row + 1;
                } else {
                    col = col + 1;
                }
            }
            state.value = {
                ...state.value,
                edges};
        },

        updateCloud: (state, action) => {
            const {networks={}, services={}, proxies={}, resources: updates={}} = action.payload;
            const {resources: _resources={}} = state.value;
            const containers = {};
            const connections = [];
            const resources = {..._resources, ...updates};

            // remove missing items
            for (const k of Object.keys(resources)) {
                const resourceType = k.split(':')[0];
                const resourceName = k.split(':').pop();
                const _check = {network: networks, service: services, proxy: proxies};
                for (const [_k, _v] of Object.entries(_check)) {
                    if (resourceType === _k && !_v[resourceName]) {
                        delete resources[k];
                    }
                }
            }
            // add new items
            for (const k of Object.keys(networks)) {
                if (!resources['network:' + k]) {
                    resources['network:' + k] = [getX('cloud'), getY('cloud')];
                }
            }
            for (const [k, v] of Object.entries(services)) {
                if (!resources['service:' + v.service_type + ':' + k]) {
                    resources['service:' + v.service_type + ':' + k] = [getX(), getY()];
                    containers[v.id] = {...v};
                    containers[v.id] = {type: 'service', ...v};
                }
            }
            for (const [k, v] of Object.entries(proxies)) {
                if (!resources['proxy:' + k]) {
                    resources['proxy:' + k] = [getX(), getY()];
                    containers[v.id] = {type: 'proxy', ...v};
                }
            }
            for (const [k, v] of Object.entries(networks)) {
                for(const service of v.services || []) {
                    if (!services[service]) {
                        continue;
                    }
                    connections.push([
                        ...resources['network:' + k].map(_v => _v + 25),
                        ...resources['service:' + services[service].service_type + ':' + service].map(_v => _v + 25)]);
                }
                for(const proxy of v.proxies || []) {
                    if (!proxies[proxy]) {
                        continue;
                    }
                    connections.push([
                        ...resources['network:' + k].map(_v => _v + 25),
                        ...resources['proxy:' + proxy].map(_v => _v + 25)]);
                }

            }
            state.value = {
                ...state.value,
                connections,
                ...{resources: {...resources}},
            };
        }
    }
});

export const {updateUI, updateCloud, updateEdges} = UISlice.actions;


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
                for (const container of containers) {
                    for (const service of Object.values(action.payload.services)) {
                        if (service["id"] === container) {
                            _networks[k].services = _networks[k].services || [];
                            _networks[k].services.push(service["name"]);
                            break;
                        }
                    }
                    for (const proxy of Object.values(action.payload.proxies)) {
                        if (proxy["id"] === container) {
                            _networks[k].proxies = _networks[k].proxies || [];
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
            delete state.value['validation'];
            const {status} = state.value;
            if (status && status !== undefined && action.payload.status === 'initializing') {
                delete action.payload['status'];
            }
            state.value = {...state.value, ...action.payload};
        },
        clearForm: (state, action) => {
            state.value = {};
        },
    }
});

export const {updateForm, clearForm} = formSlice.actions;



const exampleSlice = createSlice({
    name: 'example',
    initialState: {
        value: {}
    },
    reducers: {
        updateExamples: (state, action) => {
            const {service_types} = action.payload;
            const _examples = {playground: {}, envoy: {}};
            for (const [k, v] of Object.entries(service_types)) {
                const {labels} = v;
                if (Object.keys(labels).indexOf('envoy.playground.example.setup.config') !== -1) {
                    _examples.playground[labels['envoy.playground.example.setup.name']] = 'http://localhost:8000/static/' + k + '/' + labels['envoy.playground.example.setup.config'];
                }
                if (Object.keys(labels).indexOf('envoy.playground.example.config') !== -1) {
                    _examples.envoy[labels['envoy.playground.example.name']] = 'http://localhost:8000/static/' + k + '/' + labels['envoy.playground.example.config'];
                }
            }
            state.value = _examples;
        },
    }
});

export const {removeExample, updateExamples} = exampleSlice.actions;


const rootReducer = combineReducers({
    example: exampleSlice.reducer,
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
