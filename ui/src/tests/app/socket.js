
import each from 'jest-each';

import ReconnectingWebSocket from 'reconnecting-websocket';

import PlaygroundSocket from '../../app/socket';
import {updateUI} from '../../app/store';


jest.mock('reconnecting-websocket');
jest.mock('../../app/store');


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
    [{playtime_errors: null, type: 'HANDLER2'}],
    [{playtime_errors: 'ERRORS', type: 'HANDLER1'}],
    [{playtime_errors: 'ERRORS', type: 'HANDLER2'}],
    [{playtime_errors: 'ERRORS', type: null}]];


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
        expect(playground.api.handleTwo.mock.calls).toEqual([]);
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


test('socket close', async () => {
    updateUI.mockReturnValue(23);
    const playground = {api: 'API', store: 'STORE'};
    const socket = new DummyPlaygroundSocket(playground, 'ADDRESS');
    socket.store = {dispatch: jest.fn(async () => {})};
    const evt = {target: {_shouldReconnect: false}};
    await socket.close(evt);
    expect(socket.disconnected).toEqual(false);
    expect(socket.store.dispatch.mock.calls).toEqual([]);
    expect(updateUI.mock.calls).toEqual([]);
    evt.target._shouldReconnect = true;
    await socket.close(evt);
    expect(socket.disconnected).toEqual(true);
    expect(socket.store.dispatch.mock.calls).toEqual([[23]]);
    expect(updateUI.mock.calls).toEqual([[{"toast": "socket-disconnected"}]]);
});


test('socket open', async () => {
    updateUI.mockReturnValue(23);
    const playground = {api: 'API', store: 'STORE', load: jest.fn(async () => {})};
    const socket = new DummyPlaygroundSocket(playground, 'ADDRESS');
    socket.store = {dispatch: jest.fn(async () => {})};
    await socket.open({});
    expect(socket.store.dispatch.mock.calls).toEqual([]);
    expect(updateUI.mock.calls).toEqual([]);
    expect(playground.load.mock.calls).toEqual([]);
    socket.disconnected = true;
    await socket.open({});
    expect(socket.store.dispatch.mock.calls).toEqual([[23]]);
    expect(updateUI.mock.calls).toEqual([[{toast: null}]]);
    expect(playground.load.mock.calls).toEqual([[]]);
});
