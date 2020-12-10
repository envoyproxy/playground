
import PlaygroundAPI from '../../app/api';
import {updateUI} from '../../app/store';

jest.mock('../../app/store');


test('api constructor', () => {
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    expect(api.playground).toEqual(playground);
    expect(api.address).toEqual('ADDRESS');
});

test('api _getAddress', () => {
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    expect(api._getAddress('/PATH')).toEqual('ADDRESS/PATH');
});

test('api get', async () => {
    const _fetch = global.fetch;
    const response = {json: jest.fn(async () => 'JSON')};
    global.fetch = jest.fn(async () => response);
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    const result = await api.get('/PATH');
    expect(result).toEqual('JSON');
    expect(global.fetch.mock.calls).toEqual([['ADDRESS/PATH']]);
    expect(response.json.mock.calls).toEqual([[]]);
    global.fetch = _fetch;
});


test('api errors', async () => {
    const playground = {store: {dispatch: jest.fn(async () => {})}};
    updateUI.mockImplementation(() => 'UPDATEDUI');
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    await api.errors({playtime_errors: 'OOPSIE'});
    expect(playground.store.dispatch.mock.calls).toEqual([["UPDATEDUI"]]);
    expect(updateUI.mock.calls).toEqual([[{"errors": "OOPSIE", "toast": "errors"}]]);
});
