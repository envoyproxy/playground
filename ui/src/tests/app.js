
import {Playground} from '../app';

const originalConsoleError = global.console.error;


// todo: move this to global setup
// Catch PropTypes errors and turn them into test errors
beforeEach(() => {
    global.console.error = (...args) => {
        const propTypeFailures = [/Warning: Failed %s type/];
        if (propTypeFailures.some(p => p.test(args[0]))) {
            originalConsoleError(...args);
            throw new Error(args[0]);
        }
        originalConsoleError(...args);
    };
});


test('playground constructor', () => {
    const store = {};
    const playground = new Playground(store, 'API', 'SOCKET');
    expect(playground.store).toEqual(store);
});
