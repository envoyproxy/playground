
import each from 'jest-each';

import ReconnectingWebSocket from 'reconnecting-websocket';

import PlaygroundSocket from '../../app/socket';


jest.mock('reconnecting-websocket');

let addListeners;


class DummyPlaygroundSocket extends PlaygroundSocket {
    addListeners = addListeners;
}


beforeEach(() => {
    addListeners = PlaygroundSocket.prototype.addListeners;
    PlaygroundSocket.prototype.addListeners = jest.fn();
});


afterEach(() => {
    PlaygroundSocket.prototype.addListeners = addListeners;
});


test('socket constructor', () => {
    const playground = {api: 'API', store: 'STORE'};
    const socket = new PlaygroundSocket(playground, 'ADDRESS');
    expect(socket.playground).toEqual(playground);
    expect(socket.address).toEqual('ADDRESS');
    expect(ReconnectingWebSocket.mock.calls).toEqual([['ADDRESS']]);
    expect(socket.store).toEqual('STORE');
    expect(socket.api).toEqual('API');
    expect(socket.ws).toEqual(ReconnectingWebSocket.mock.instances[0]);
    expect(socket.addListeners.mock.calls).toEqual([[]]);
    expect(socket._state).toEqual('starting');
    expect(socket.disconnected).toEqual(false);
    expect(socket.listeners).toEqual(['message', 'close', 'open']);
});


test('socket addListeners', () => {
    const playground = {api: 'API', store: 'STORE'};
    const socket = new DummyPlaygroundSocket(playground, 'ADDRESS');
    socket.ws = {addEventListener: jest.fn()};
    socket.addListeners();
    expect(socket.ws.addEventListener.mock.calls).toEqual([
        ['message', socket.message],
        ['close', socket.close],
        ['open', socket.open]]);
});


const msgTest = [
    [{playtime_errors: null, type: 'HANDLER1'}],
];


each(msgTest).test('socket message', async (parsed) => {
    const playground = {
        api: {
            handlers: {HANDLER1: 'handleOne', HANDLER2: 'handleTwo'},
            handleErrors: jest.fn(),
            handleOne: jest.fn(),
            handleTwo: jest.fn(),
        },
        store: 'STORE'};
    const socket = new DummyPlaygroundSocket(playground, 'ADDRESS');
    const _parse = global.JSON.parse;
    global.JSON.parse = jest.fn(()  => parsed);
    await socket.message({data: 'DATA'});
    expect(global.JSON.parse.mock.calls).toEqual([['DATA']]);

    if (parsed.playtime_errors) {
        expect(playground.api.handleErrors.mock.calls).toEqual([[parsed]]);
        expect(playground.api.handleOne.mock.calls).toEqual([]);
        expect(playground.api.handleTwo.mock.calls).toEqual([[]]);
    } else {
        expect(playground.api.handleErrors.mock.calls).toEqual([]);
        if (parsed.type === 'HANDLER1') {
            expect(playground.api.handleOne.mock.calls).toEqual([[parsed]]);
            expect(playground.api.handleTwo.mock.calls).toEqual([]);
        } else if (parsed.type === 'HANDLER2')  {
            expect(playground.api.handleOne.mock.calls).toEqual([]);
            expect(playground.api.handleTwo.mock.calls).toEqual([[parsed]]);
        } else {
            expect(playground.api.handleOne.mock.calls).toEqual([]);
            expect(playground.api.handleTwo.mock.calls).toEqual([[]]);
        }
    }

    global.JSON.parse = _parse;
});
