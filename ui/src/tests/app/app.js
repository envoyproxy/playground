
import {Provider} from 'react-redux';

import {IntlProvider} from 'react-intl';

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
    const playground = {
        locale: 'FOO',
        messages: 'MESSAGES'};
    app.setState({playground});
    expect(app.text()).toBe('<Provider />');
    const provider = app.find(Provider);
    expect(provider.props().store).toEqual(store);
    const shortcuts = provider.find(ShortcutProvider);
    const intl = shortcuts.find(IntlProvider);
    expect(intl.props().messages).toEqual('MESSAGES');
    expect(intl.props().locale).toEqual('FOO');
    const context = intl.find(PlaygroundContext.Provider);
    expect(context.props().value).toEqual(playground);
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
