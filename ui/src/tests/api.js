
import PlaygroundAPI from '../app/api';


test('api constructor', () => {
    const store = {};
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground.address).toEqual('ADDRESS');
});
