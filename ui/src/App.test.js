import {render, screen} from '@testing-library/react';
import App from './app';

test('renders learn react link', () => {
    render(<App />);
    // expect(screen.getByRole('banner')[0]).toHaveTextContent('Envoy playground');
});
