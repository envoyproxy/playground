
import PlaygroundAPI from '../../app/api';


test('api constructor', () => {
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground.address).toEqual('ADDRESS');
});

test('api _getAddress', () => {
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground._getAddress('/PATH')).toEqual('ADDRESS/PATH');
});

test('api get', async () => {
    const _fetch = global.fetch;
    const response = {json: jest.fn(async () => 'JSON')};
    global.fetch = jest.fn(async () => response);
    const playground = new PlaygroundAPI('ADDRESS');
    const result = await playground.get('/PATH');
    expect(result).toEqual('JSON');
    expect(global.fetch.mock.calls).toEqual([['ADDRESS/PATH']]);
    expect(response.json.mock.calls).toEqual([[]]);
    global.fetch = _fetch;
});


test('api post', async () => {
    const _fetch = global.fetch;
    const response = {json: jest.fn(async () => 'JSON')};
    global.fetch = jest.fn(async () => response);
    const playground = new PlaygroundAPI('ADDRESS');
    playground._getAddress = jest.fn(() => 'FQADDRESS');
    playground._getPostPayload = jest.fn(() => 'POSTDATA');
    const result = await playground.post('/PATH', 'DATA');
    expect(result).toEqual('JSON');
    expect(global.fetch.mock.calls).toEqual([['FQADDRESS', 'POSTDATA']]);
    expect(response.json.mock.calls).toEqual([[]]);
    expect(playground._getAddress.mock.calls).toEqual([['/PATH']]);
    expect(playground._getPostPayload.mock.calls).toEqual([['DATA']]);
    global.fetch = _fetch;
});
