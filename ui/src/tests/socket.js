
import ReconnectingWebSocket from 'reconnecting-websocket';

import PlaygroundSocket from '../app/socket';


jest.mock('reconnecting-websocket');

let addListeners;


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
    expect(socket.listeners).toEqual({
        message: socket.onMessage,
        close: socket.onDisconnect,
        open: socket.onConnect});
});
