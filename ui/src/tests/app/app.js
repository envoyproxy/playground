
import {Provider} from 'react-redux';

import {shallow} from "enzyme";

import {
    PlaygroundApp, PlaygroundContext,
    store} from '../../app';
import {Layout} from '../../layout';

const mockLoad = jest.fn(async () => {});

jest.mock('../../app/playground', () => {
    return function () {
        return {load: mockLoad};
    };
});


class DummyPlaygroundApp extends PlaygroundApp {

    componentDidMount () {
    }
    componentWantsToMount = PlaygroundApp.prototype.componentDidMount;
}


test('PlaygroundApp render', () => {
    const app = shallow(<DummyPlaygroundApp />);
    expect(app.text()).toBe('');
    app.setState({playground: 'PLAYGROUND'});
    expect(app.text()).toBe('<Provider />');
    const provider = app.find(Provider);
    expect(provider.props().store).toEqual(store);
    const context = provider.find(PlaygroundContext.Provider);
    expect(context.props().value).toEqual('PLAYGROUND');
    const layout = context.find(Layout);
    expect(layout.props()).toEqual({});
});


test('PlaygroundApp mount', async () => {
    const app = shallow(<DummyPlaygroundApp />);
    const _setState = jest.fn();
    app.instance().setState = _setState;
    await app.instance().componentWantsToMount();
    expect(mockLoad.mock.calls).toEqual([[]]);
    expect(_setState.mock.calls).toEqual([[
        {playground: {load: mockLoad}}]]);
});
