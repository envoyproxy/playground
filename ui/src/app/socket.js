
import {updateUI} from "../app/store";

import ReconnectingWebSocket from 'reconnecting-websocket';


export default class PlaygroundSocket {
    _listeners = ['message', 'close', 'open'];

    constructor(playground, address) {
        const {api, store} = playground;
        this.playground = playground;
        this.address = address;
        this.ws = new ReconnectingWebSocket(address);
        this.store = store;
        this.api = api;
        this.addListeners();
        this._state = 'starting';
        this.disconnected = false;
    }

    get listeners () {
        return this._listeners;
    }

    addListeners () {
        for (const event of this.listeners) {
            this.ws.addEventListener(event, this[event]);
        }
    }

    close = async (evt) => {
        // todo: check Reason to prevent onload firing
        const {target} = evt;
        const {dispatch} = this.store;
        if (target._shouldReconnect) {
            this.disconnected = true;
            await dispatch(updateUI({toast: 'socket-disconnected'}));
        }
    };

    message = async (event) => {
        const data = JSON.parse(event.data);
        const {playtime_errors, type} = data;
        // console.log("INCOMING", data);
        if (playtime_errors) {
            await this.api.handleErrors(data);
        } else {
            await this.api[this.api.handlers[type]](data);
        }
    }

    open = async (evt) => {
        const {dispatch} = this.store;
        if (this.disconnected) {
            await dispatch(updateUI({toast: null}));
            await this.playground.load();
        }
    };
}
