
import {shallow} from "enzyme";

import {Content} from '../../layout';
import {PlaygroundTabs} from '../../shared/tabs';
import CloudContent from '../../cloud';
import EdgesContent from '../../edges';


test('Content render', () => {
    const content = shallow(<Content />);
    expect(content.text()).toEqual('');
    const tabs = content.find(PlaygroundTabs);
    expect(tabs.props()).toEqual({
        name: 'content',
        tabs: content.instance().tabs});
    expect(Object.keys(content.instance().tabs).length).toEqual(2);
    expect(Object.keys(content.instance().tabs)[0]).toEqual('Cloud');
    expect(content.instance().tabs.Cloud.props).toEqual({});
    expect(content.instance().tabs.Cloud.type).toEqual(CloudContent);
    expect(content.instance().tabs.Edges.props).toEqual({});
    expect(content.instance().tabs.Edges.type).toEqual(EdgesContent);
});
