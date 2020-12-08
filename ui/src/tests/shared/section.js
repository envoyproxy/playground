
import each from 'jest-each';

import {shallow} from "enzyme";

import {
    PlaygroundSection} from '../../shared/section';


test('PlaygroundSection render', () => {
    const section = shallow(
        <PlaygroundSection
          title="TITLE"
          icon="ICON">
          <p>FOO</p>
          <p>BAR</p>
        </PlaygroundSection>);
    expect(section.text()).toEqual('TITLEFOOBAR');
    const _section = section.find('section');
    expect(_section.props().className).toEqual('control-pane');
    const header = _section.find('header');
    expect(header.props().className).toEqual(
        'pt-1 pb-1 bg-dark border-top border-bottom');
    const img = header.props().children[0];
    expect(img.props).toEqual(
        {"alt": "TITLE",
         "className": "ml-2 mr-2",
         "src": "ICON",
         "width": "24px"});
    expect(header.props().children[1]).toEqual('TITLE');
    const div = _section.find('div');
    expect(div.props().className).toEqual('pt-2 bg-medium scrollable');
    expect(div.text()).toEqual('FOOBAR');
});
