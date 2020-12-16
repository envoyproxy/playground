
import {shallow} from "enzyme";

import {PlaygroundPage} from '../../layout';
import {PlaygroundSiteHome} from '../../home';
import PlaygroundSiteHeader from '../../layout/header';


test('PlaygroundPage render', () => {
    const app = shallow(<PlaygroundPage />);
    expect(app.text()).toBe("<PlaygroundSiteHeader /><PlaygroundSiteHome />");
    const div = app.find('div');
    expect(div.props().className).toEqual("App container-fluid");
    const header = div.find('header');
    expect(header.props().className).toEqual("App-header row");
    const siteHeader = header.find(PlaygroundSiteHeader);
    expect(siteHeader.props()).toEqual({});
    const main = div.find('main');
    expect(main.props().className).toEqual("App-main row");
    const home = main.find(PlaygroundSiteHome);
    expect(home.props()).toEqual({});
});
