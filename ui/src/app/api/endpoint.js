
import {logEvent, updateUI} from "../../app/store";

import {
    PlaygroundAPIImages, PlaygroundAPINetworks,
    PlaygroundAPIServices, PlaygroundAPIProxies} from './handler';


export default class PlaygroundAPI {

    constructor (playground, address) {
        this.address = address;
        this.playground = playground;
        this.image = new PlaygroundAPIImages(this);
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

    async get (path) {
        const response = await fetch(this._getAddress(path));
        return await response.json();
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
