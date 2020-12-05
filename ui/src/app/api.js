
export default class PlaygroundAPI {

    constructor (address) {
        this.address = address;
    }

    async get (path) {
        const response = await fetch(this.address + path);
        const data = await response.json();
        return data;
    }

    async post (path, payload) {
        const response = await fetch(
            "http://localhost:8000" + path,
            {method: "POST",
             mode: "cors",
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify(payload)});
        const data = await response.json();
        return data;
    }
}
