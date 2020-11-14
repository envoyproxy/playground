import {
    updateForm, updateUI, removeProxy, clearForm,
    updateProxies, removeNetwork, updateNetworks,
    removeService, updateServices
} from "../app/store";


export default class PlaygroundSocket {

    constructor(address, store) {
        this.store = store;
        this.ws = new WebSocket(address);
        this.addListeners();
    }

    onOpen = () => {
        this.ws.send('Hello Server!');
    }

    onClose = () => {

    }

    onMessage = (event) => {
        const eventData = JSON.parse(event.data);
        // console.log("INCOMING", eventData);
        if (eventData.type === "network") {
            if (eventData.action === "destroy") {
                this.store.dispatch(removeNetwork(eventData.id));
            } else if (eventData.action === "create") {
                this.store.dispatch(updateNetworks(eventData));
                this.store.dispatch(updateUI({modal: null}));
                this.store.dispatch(clearForm());
            } else if (eventData.action === "connect" || eventData.action === "disconnect") {
                const {service, proxy} = this.store.getState();
                this.store.dispatch(updateNetworks({
                    services: service.value,
                    proxies: proxy.value,
                    ...eventData}));
            }
        } else if (eventData.type === "container") {
            if (eventData.resource === "proxy") {
                const form = this.store.getState().form.value;
                const {name: formName} = form;
                const {id, name, status, logs} = eventData;
                const proxies = {};
                if (status === "creating") {
                    if (formName && formName === name) {
                        proxies[name] = {name};
                        this.store.dispatch(updateProxies({proxies}));
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "start") {
                    proxies[name] = {name, id};
                    this.store.dispatch(updateProxies({proxies}));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "exited") {
                    this.store.dispatch(removeProxy(eventData.id));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "destroy") {
                    this.store.dispatch(removeProxy(eventData.id));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "die") {
                    this.store.dispatch(removeProxy(eventData.id));
                    if (formName && formName === eventData.name) {
                        this.store.dispatch(updateForm({status, logs}));
                    }
                } else {
                    // console.log("UNHANDLED INCOMING", eventData);
                }
            } else {
                const form = this.store.getState().form.value;
                const {service_type, name: formName, status: formStatus, ...formData} = form;
                const {id, name, status, logs} = eventData;
                const services = {};

                // console.log("SERVICE INCOMING", eventData);

                if (status === "creating") {
                    if (formName && formName === name) {
                        // console.log('CREATE SERVICE', formData);
                        services[name] = {name, service_type};
                        this.store.dispatch(updateServices({services}));
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "start") {
                    services[name] = {name, id, service_type};
                    this.store.dispatch(updateServices({services}));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "exited") {
                    this.store.dispatch(removeService(eventData.id));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "destroy") {
                    this.store.dispatch(removeService(eventData.id));
                    if (formName && formName === name) {
                        this.store.dispatch(updateForm({status}));
                    }
                } else if (eventData.status === "die") {
                    this.store.dispatch(removeService(eventData.id));
                    if (formName && formName === eventData.name) {
                        this.store.dispatch(updateForm({status, logs}));
                    }
                } else {
                    // console.log("UNHANDLED INCOMING", eventData);
                }
            }
        }
    }

    addListeners = () => {
        this.ws.addEventListener('open', (event) => {
            this.onOpen(event);
        });

        this.ws.addEventListener('message', (event) => {
            this.onMessage(event);
        });

        this.ws.addEventListener('close', (event) => {
            this.onClose(event);
        });
    }
}
