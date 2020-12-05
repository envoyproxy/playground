
import PlaygroundAPI from '../app/api';


test('api constructor', () => {
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground.address).toEqual('ADDRESS');
});

test('api _getAddress', () => {
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground._getAddress('/PATH')).toEqual('ADDRESS/PATH');
});
