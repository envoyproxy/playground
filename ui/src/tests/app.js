
import {Playground} from '../app';
import PlaygroundAPI from '../app/api';
import PlaygroundSocket from '../app/socket';


jest.mock('../app/api');
jest.mock('../app/socket');


test('playground constructor', () => {
    const store = {};
    const playground = new Playground(store, 'API', 'SOCKET');
    expect(playground.store).toEqual(store);
    expect(PlaygroundAPI.mock.calls).toEqual([['API']]);
    expect(PlaygroundSocket.mock.calls).toEqual([[playground, 'SOCKET']]);
    expect(playground.modals).toEqual({});
    expect(playground.toast).toEqual({});
});
