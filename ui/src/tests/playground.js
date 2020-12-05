
import {Playground} from '../app';
import PlaygroundAPI from '../app/api';
import PlaygroundSocket from '../app/socket';


jest.mock('../app/api');
jest.mock('../app/socket');

let init;



class DummyPlayground extends Playground {
    init = init;
}


beforeEach(() => {
    init = Playground.prototype.init;
    Playground.prototype.init = jest.fn();
});


afterEach(() => {
    Playground.prototype.init = init;
});


test('playground constructor', () => {
    const store = {};
    const playground = new Playground(store, 'API', 'SOCKET');
    expect(playground.store).toEqual(store);
    expect(playground.apiAddress).toEqual('API');
    expect(playground.socketAddress).toEqual('SOCKET');
    expect(playground.init.mock.calls).toEqual([[]]);
});


test('playground init', () => {
    const playground = new DummyPlayground();
    playground.apiAddress = 'API';
    playground.socketAddress = 'SOCKET';
    playground.init();
    expect(PlaygroundAPI.mock.calls).toEqual([['API']]);
    expect(PlaygroundSocket.mock.calls).toEqual([[playground, 'SOCKET']]);
    expect(playground.modals).toEqual({});
    expect(playground.toast).toEqual({});
});


test('playground load', async () => {
    const playground = new Playground();
    playground.loadData = jest.fn(async () => {});
    playground.api = {get: jest.fn(async () => 'DATA')};
    await playground.load();
    expect(playground.api.get.mock.calls).toEqual([['/resources']]);
    expect(playground.loadData.mock.calls).toEqual([['DATA']]);
});


test('playground loadData', async () => {
    const playground = new Playground();
    playground.loadResources = jest.fn(async () => {});
    playground.loadUI = jest.fn(async () => {});
    await playground.loadData('DATA');
    expect(playground.loadResources.mock.calls).toEqual([['DATA']]);
    expect(playground.loadUI.mock.calls).toEqual([['DATA']]);
});
