
export default class PlaygroundAPI {

    constructor (address) {
        this.address = address;
    }

    async get (path) {
        const response = await fetch(this.address + path);
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
