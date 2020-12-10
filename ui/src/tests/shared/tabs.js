
import each from 'jest-each';

import {shallow} from "enzyme";

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import {
    PlaygroundTabs,
    PlaygroundFormTabs} from '../../shared';
import {
    BasePlaygroundTabs, PlaygroundTabContent,
    PlaygroundTabNavs} from '../../shared/tabs/base';
import {AlertValidation} from '../../shared/alerts';
import {updateUI} from '../../app/store';

jest.mock('../../app/store');


test('PlaygroundFormTabs render', () => {
    const _tabs = {TAB1: 'CONTENT1', TAB2: 'CONTENT2'};
    const tabs = shallow(
        <PlaygroundFormTabs
          name="TABSNAME"
          tabs={_tabs} />);
    expect(tabs.text()).toEqual("<AlertValidation />");
    const validation = tabs.find(AlertValidation);
    expect(validation.props()).toEqual({validation: undefined});
    const pgtabs = tabs.find(PlaygroundTabs);
    expect(pgtabs.props()).toEqual({
        "name": "TABSNAME",
        "tabs": {"TAB1": "CONTENT1", "TAB2": "CONTENT2"}});
});


test('PlaygroundFormTabs render validation', () => {
    const _tabs = {TAB1: 'CONTENT1', TAB2: 'CONTENT2'};
    const _validation = {ERROR1: 'ANERROR'};
    const tabs = shallow(
        <PlaygroundFormTabs
          name="TABSNAME"
          validation={_validation}
          tabs={_tabs} />);
    expect(tabs.text()).toEqual("<AlertValidation />");
    const validation = tabs.find(AlertValidation);
    expect(validation.props()).toEqual({validation: _validation});
    const pgtabs = tabs.find(PlaygroundTabs);
    expect(pgtabs.props()).toEqual({
        "name": "TABSNAME",
        "tabs": {"TAB1": "CONTENT1", "TAB2": "CONTENT2"}});
});


test('PlaygroundTabs render', () => {
    const _tabs = {TAB1: 'CONTENT1', TAB2: 'CONTENT2'};
    const dispatch = jest.fn();
    const tabs = shallow(
        <BasePlaygroundTabs
          name="TABSNAME"
          dispatch={dispatch}
          ui={{}}
          tabs={_tabs} />);
    expect(tabs.text()).toEqual("<PlaygroundTabNavs /><PlaygroundTabContent />");
    const navs = tabs.find(PlaygroundTabNavs);
    expect(navs.props()).toEqual({
        "active": undefined,
        "tabs": ["TAB1", "TAB2"],
        "toggle": tabs.instance().toggle});
    const content = tabs.find(PlaygroundTabContent);
    expect(content.props()).toEqual({"active": undefined, "tabs": ["CONTENT1", "CONTENT2"]});
});


test('PlaygroundTabs render active', () => {
    const _tabs = {TAB1: 'CONTENT1', TAB2: 'CONTENT2'};
    const dispatch = jest.fn();
    const tabs = shallow(
        <BasePlaygroundTabs
          name="TABSNAME"
          dispatch={dispatch}
          ui={{tabs: {TABSNAME: 23}}}
          tabs={_tabs} />);
    expect(tabs.text()).toEqual("<PlaygroundTabNavs /><PlaygroundTabContent />");
    const navs = tabs.find(PlaygroundTabNavs);
    expect(navs.props()).toEqual(
        {"active": 23,
         "tabs": ["TAB1", "TAB2"],
         "toggle": tabs.instance().toggle});
    const content = tabs.find(PlaygroundTabContent);
    expect(content.props()).toEqual({"active": 23, "tabs": ["CONTENT1", "CONTENT2"]});
});


const tabsTest = [
    [{}, {tabs: {TABSNAME: 73}}],
    [{foo: 'BAR'}, {tabs: {TABSNAME: 73}}],
    [{foo: 'BAR', tabs: {}}, {tabs: {TABSNAME: 73}}],
    [{foo: 'BAR', tabs: {OTHERTABS: 113}}, {tabs: {OTHERTABS: 113, TABSNAME: 73}}],
    [{foo: 'BAR', tabs: {OTHERTABS: 113, TABSNAME: 23}}, {tabs: {OTHERTABS: 113, TABSNAME: 73}}],
];


each(tabsTest).test('PlaygroundTabs render toggle', (ui, expected) => {
    updateUI.mockImplementation(() => 'UPDATEDUI');
    const _tabs = {TAB1: 'CONTENT1', TAB2: 'CONTENT2'};
    const dispatch = jest.fn();
    const tabs = shallow(
        <BasePlaygroundTabs
          name="TABSNAME"
          dispatch={dispatch}
          ui={ui}
          tabs={_tabs} />);
    tabs.instance().toggle(73);
    expect(dispatch.mock.calls).toEqual([["UPDATEDUI"]]);
    expect(updateUI.mock.calls).toEqual([[expected]]);
});


each([{}, {active: 0}, {active: 1}, {active: 2}]).test('PlaygroundTabNavs render', (active) => {
    updateUI.mockImplementation(() => 'UPDATEDUI');
    const tabs = ['TAB0', 'TAB1', 'TAB2'];
    const toggle = jest.fn();
    const navs = shallow(
        <PlaygroundTabNavs
          {...active}
          toggle={toggle}
          tabs={tabs} />);
    expect(navs.text()).toEqual('<Nav />');
    const tabnavs = navs.find(Nav);
    expect(tabnavs.props().tabs).toEqual(true);
    expect(tabnavs.props().children.length).toEqual(3);
    for (const i of [0, 1, 2]) {
        const child = tabnavs.find(NavItem).at(i);
        const link = child.find(NavLink);
        expect(link.props().href).toEqual('#');
        expect(link.props().children).toEqual('TAB' + i);
        if (active.active === i || (!active.active && i === 0)) {
            expect(link.props().className).toEqual('ml-2 active');
        } else {
            expect(link.props().className).toEqual('ml-2');
        }
        const click = link.props().onClick;
        click();
        expect(toggle.mock.calls).toEqual([[i]]);
        toggle.mockClear();
    }
});


test('PlaygroundTabContent render', () => {
    updateUI.mockImplementation(() => 'UPDATEDUI');
    const tabs = ['TAB0', 'TAB1', 'TAB2'];
    const content = shallow(
        <PlaygroundTabContent
          tabs={tabs} />);
    expect(content.text()).toEqual('<TabContent />');
    const tabcontent = content.find(TabContent);
    expect(tabcontent.props().activeTab).toEqual(0);
    expect(tabcontent.props().children.length).toEqual(3);
    let i = 0;
    for (const child of tabcontent.props().children) {
        expect(child.type).toEqual(TabPane);
        expect(child.props.tabId).toEqual(i);
        expect(child.props.children).toEqual('TAB' + i);
        i += 1;
    }
});
