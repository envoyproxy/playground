
import {logEvent, updateUI} from "../../app/store";

import {
    PlaygroundAPINetworks,
    PlaygroundAPIServices, PlaygroundAPIProxies} from './handler';


export default class PlaygroundAPI {

    constructor (playground, address) {
        this._address = address;
        this.playground = playground;
        this.network = new PlaygroundAPINetworks(this);
        this.service = new PlaygroundAPIServices(this);
        this.proxy = new PlaygroundAPIProxies(this);
    }

    clear = async (data) => {
        const {store} = this.playground;
        const {dispatch} = store;
        await dispatch(logEvent({
            status: 'clear',
            name: 'all',
            type: 'playground'}));
        await this.get('/clear');
    };

    errors = async (data) => {
        const {store} = this.playground;
        const {dispatch} = store;
        await dispatch(updateUI({
            toast: 'errors',
            errors: data.playtime_errors}));
    }

    async get (path, type) {
        const response = await fetch(this.address(path));
        return await response[type || 'json']();
    }

    async post (path, payload) {
        const response = await fetch(
            this.address(path),
            this._getPostPayload(payload));
        return await response.json();
    }

    address = (path) => {
        return this._address + path;
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
