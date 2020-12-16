
import {Provider} from 'react-redux';

import {shallow} from "enzyme";

import {
    PlaygroundSiteApp, PlaygroundSiteContext,
    store} from '../../app';
import {PlaygroundPage} from '../../layout';

const mockLoad = jest.fn(async () => {});

jest.mock('../../app/site', () => {
    return function () {
        return {load: mockLoad};
    };
});


class DummyPlaygroundSiteApp extends PlaygroundSiteApp {

    componentDidMount () {
    }
    componentWantsToMount = PlaygroundSiteApp.prototype.componentDidMount;
}


test('PlaygroundSiteApp render', () => {
    const app = shallow(<DummyPlaygroundSiteApp />);
    expect(app.text()).toBe('');
    app.setState({site: 'SITE'});
    expect(app.text()).toBe('<Provider />');
    const provider = app.find(Provider);
    expect(provider.props().store).toEqual(store);
    const site = provider.find(PlaygroundSiteContext.Provider);
    expect(site.props().value).toEqual('SITE');
    const page = site.find(PlaygroundPage);
    expect(page.props()).toEqual({});
});


test('PlaygroundSiteApp mount', async () => {
    const app = shallow(<DummyPlaygroundSiteApp />);
    const _setState = jest.fn();
    app.instance().setState = _setState;
    await app.instance().componentWantsToMount();
    expect(mockLoad.mock.calls).toEqual([[]]);
    expect(_setState.mock.calls).toEqual([[
        {site: {load: mockLoad}}]]);
});
