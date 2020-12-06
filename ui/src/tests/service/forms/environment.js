
import {shallow} from "enzyme";

import {ServiceEnvironmentFieldList} from '../../../service/forms/environment';


test('ServiceEnvironmentFieldList render', () => {
    const onDelete = jest.fn();
    const _vars = {ENV1: 'FOO', ENV2: 'BAR', ENV3: 'BAZ'};
    const list = shallow(
        <ServiceEnvironmentFieldList
          onDelete={onDelete}
          vars={_vars}
        />);
    expect(list.text()).toEqual(
        "<PlaygroundFieldList />");
    expect(list.props().headers).toEqual([
        [6, <span>Variable name</span>],
        [5, <span>Variable value</span>]]);
    expect(list.props().row).toEqual(list.instance().row);
    expect(list.props().keys).toEqual(Object.keys(_vars));
    expect(list.instance().row('ENV1')).toEqual([
        <span>ENV1</span>,
        <span>FOO</span>]);
});
