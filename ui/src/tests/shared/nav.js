
import {shallow} from "enzyme";

import {Nav, Navbar, NavItem} from 'reactstrap';

import {PlaygroundPageNav} from '../../shared';


test('PlaygroundPageNav render', () => {
    const nav = shallow(
        <PlaygroundPageNav
          navs={[[23, 'NAV1'], [117, 'NAV2']]} />);
    expect(nav.text()).toEqual('<Navbar />');
    const navbar = nav.find(Navbar);
    expect(navbar.props().tag).toEqual('nav');
    expect(navbar.props().className).toEqual('col p-0 pl-1 mt-0 mb-0 bg-dark ');
    const _nav = navbar.find(Nav);
    expect(_nav.props().className).toEqual("container-fluid");
    expect(_nav.props().children.length).toEqual(2);
    expect(_nav.props().children[0].type).toEqual(NavItem);
    expect(_nav.props().children[0].props).toEqual(
        {"children": "NAV1",
         "className": "col-sm-23 pl-0",
         "tag": "li"});
    expect(_nav.props().children[1].type).toEqual(NavItem);
    expect(_nav.props().children[1].props).toEqual(
        {"children": "NAV2",
         "className": "col-sm-117 pl-0",
         "tag": "li"});

});

test('PlaygroundPageNav render className', () => {
    const nav = shallow(
        <PlaygroundPageNav
          className="PLAYCLASS"
          navs={[[23, 'NAV1'], [117, 'NAV']]} />);
    expect(nav.find(Navbar).props().className).toEqual('col p-0 pl-1 mt-0 mb-0 bg-dark PLAYCLASS');
});


test('PlaygroundPageNav render tag', () => {
    const nav = shallow(
        <PlaygroundPageNav
          tag="header"
          navs={[[23, 'NAV1'], [117, 'NAV']]} />);
    expect(nav.find(Navbar).props().tag).toEqual('header');
});
