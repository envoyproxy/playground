
import PlaygroundAPI from '../app/api';


test('api constructor', () => {
    const playground = new PlaygroundAPI('ADDRESS');
    expect(playground.address).toEqual('ADDRESS');
});
