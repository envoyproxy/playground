
import {shallow} from "enzyme";

import {Footer} from '../../layout';
import {
    PlaygroundRepository,
    PlaygroundPageNav} from '../../shared';


test('Footer render', () => {
    const footer = shallow(<Footer />);
    expect(footer.text()).toEqual('<PlaygroundPageNav />');
    const nav = footer.find(PlaygroundPageNav);
    expect(nav.props()).toEqual({
        navs: footer.instance().navs,
        tag: 'footer'});
    expect(footer.instance().navs.length).toEqual(2);
    expect(footer.instance().navs[0]).toEqual([9, '']);
    expect(footer.instance().navs[1][0]).toEqual(3);
    const repo = footer.instance().navs[1][1];
    expect(repo.type).toEqual(PlaygroundRepository);
    expect(repo.props).toEqual({});
});
