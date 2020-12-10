
import {shallow} from "enzyme";

import {
    PlaygroundTabs,
    PlaygroundFormTabs} from '../../shared';
import {AlertValidation} from '../../shared/alerts';


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
