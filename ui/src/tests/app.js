import {render} from '@testing-library/react';
import {PlaygroundApp} from '../app';

import 'reactstrap';

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


test('renders learn react link', () => {
    render(<PlaygroundApp />);
    // expect(screen.getByRole('banner')[0]).toHaveTextContent('Envoy playground');
});
