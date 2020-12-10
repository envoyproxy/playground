
import {shallow} from "enzyme";

import {Header} from '../../layout';
import {
    PlaygroundLogotype,
    PlaygroundClearWidget,
    PlaygroundSaveLoadWidget,
    PlaygroundPageNav} from '../../shared';


test('Header render', () => {
    const header = shallow(<Header />);
    expect(header.text()).toEqual('<PlaygroundPageNav />');
    const nav = header.find(PlaygroundPageNav);
    expect(nav.props()).toEqual({
        navs: header.instance().navs,
        tag: 'header'});
    expect(header.instance().navs.length).toEqual(3);
    expect(header.instance().navs[0][0]).toEqual(8);
    const logotype = header.instance().navs[0][1];
    expect(logotype.type).toEqual(PlaygroundLogotype);
    expect(logotype.props).toEqual({});

    expect(header.instance().navs[1][0]).toEqual(3);
    const saveload = header.instance().navs[1][1];
    expect(saveload.type).toEqual(PlaygroundSaveLoadWidget);
    expect(saveload.props).toEqual({});

    expect(header.instance().navs[2][0]).toEqual(1);
    const clear = header.instance().navs[2][1];
    expect(clear.type).toEqual(PlaygroundClearWidget);
    expect(clear.props).toEqual({});
});
