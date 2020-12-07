
import PlaygroundAPI from '../../app/api';


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


test('api post', async () => {
    const _fetch = global.fetch;
    const response = {json: jest.fn(async () => 'JSON')};
    global.fetch = jest.fn(async () => response);
    const playground = {PG: true};
    const api = new PlaygroundAPI(playground, 'ADDRESS');
    api._getAddress = jest.fn(() => 'FQADDRESS');
    api._getPostPayload = jest.fn(() => 'POSTDATA');
    const result = await api.post('/PATH', 'DATA');
    expect(result).toEqual('JSON');
    expect(global.fetch.mock.calls).toEqual([['FQADDRESS', 'POSTDATA']]);
    expect(response.json.mock.calls).toEqual([[]]);
    expect(api._getAddress.mock.calls).toEqual([['/PATH']]);
    expect(api._getPostPayload.mock.calls).toEqual([['DATA']]);
    global.fetch = _fetch;
});
