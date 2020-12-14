
import PlaygroundAPI from '../../app/api';
import {logEvent, updateUI} from '../../app/store';

jest.mock('../../app/store');


test('api constructor', () => {
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    expect(api.playground).toEqual(playground);
    expect(api._address).toEqual('ADDRESS');
});

test('api address', () => {
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    expect(api.address('/PATH')).toEqual('ADDRESS/PATH');
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


test('api post', async () => {
    const _fetch = global.fetch;
    const response = {json: jest.fn(async () => 'JSON')};
    global.fetch = jest.fn(async () => response);
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    api.address = jest.fn(() => 'FQADDRESS');
    api._getPostPayload = jest.fn(() => 'POSTDATA');
    const result = await api.post('/PATH', 'DATA');
    expect(result).toEqual('JSON');
    expect(global.fetch.mock.calls).toEqual([['FQADDRESS', 'POSTDATA']]);
    expect(response.json.mock.calls).toEqual([[]]);
    expect(api.address.mock.calls).toEqual([['/PATH']]);
    expect(api._getPostPayload.mock.calls).toEqual([['DATA']]);
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


test('api clear', async () => {
    const playground = {store: {dispatch: jest.fn(async () => {})}};
    logEvent.mockImplementation(() => 'LOGGED');
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    api.get = jest.fn(async () => {});
    await api.clear();
    expect(playground.store.dispatch.mock.calls).toEqual([["LOGGED"]]);
    expect(api.get.mock.calls).toEqual([["/clear"]]);
    expect(logEvent.mock.calls).toEqual([[{
        "name": "all",
        "type": "playground",
        "status": "clear"}]]);
});
