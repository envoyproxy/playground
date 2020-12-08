
import {shallow} from "enzyme";

import {ServiceEnvironmentFieldList} from '../../../service/forms/environment';


test('ServiceEnvironmentFieldList render', () => {
    const onDelete = jest.fn();
    const _vars = {ENV1: 'FOO', ENV2: 'true', ENV3: 'false'};
    const list = shallow(
        <ServiceEnvironmentFieldList
          onDelete={onDelete}
          vars={_vars}
        />);
    expect(list.text()).toEqual(
        "<PlaygroundFieldList />");
    expect(list.props().headers).toEqual([
        [5, <div>Variable name</div>],
        [6, <div>Variable value</div>]]);
    expect(list.props().row).toEqual(list.instance().row);
    expect(list.props().keys).toEqual(Object.keys(_vars));
    expect(list.instance().row('ENV1')).toEqual([
        <div className="p-1 pl-2">ENV1</div>,
        <div className="p-1 text-muted">FOO</div>]);
    expect(list.instance().row('ENV2')).toEqual([
        <div className="p-1 pl-2">ENV2</div>,
        <div className="p-1 text-primary">true</div>]);
    expect(list.instance().row('ENV3')).toEqual([
        <div className="p-1 pl-2">ENV3</div>,
        <div className="p-1 text-primary">false</div>]);
});
