
import {shallow} from "enzyme";

import PlaygroundSiteHeader, {
    PlaygroundSiteRepository,
    PlaygroundSiteDocs, PlaygroundPageNav} from '../../layout/header';


test('PlaygroundSiteHeader render', () => {
    const header = shallow(<PlaygroundSiteHeader />);
    expect(header.text()).toEqual('<PlaygroundPageNav />');
    const nav = header.find(PlaygroundPageNav);
    expect(nav.props()).toEqual({
        navs: header.instance().navs,
        className: "border-bottom border-dark"});
    expect(header.instance().navs).toEqual([
        <PlaygroundSiteRepository />,
        <PlaygroundSiteDocs />]);
});
