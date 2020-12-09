
import {Provider} from 'react-redux';

import {shallow} from "enzyme";

import {ShortcutProvider} from 'react-keybind';

import {
    PlaygroundApp, PlaygroundContext,
    store} from '../../app';
import {Page} from '../../layout';

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
    expect(app.text()).toBe('<h />');
    const shortcuts = app.find(ShortcutProvider);
    const provider = shortcuts.find(Provider);
    expect(provider.props().store).toEqual(store);
    const context = provider.find(PlaygroundContext.Provider);
    expect(context.props().value).toEqual('PLAYGROUND');
    const div = context.find('div');
    expect(div.props().className).toEqual('App');
    const page = div.find(Page);
    expect(page.props()).toEqual({});
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
