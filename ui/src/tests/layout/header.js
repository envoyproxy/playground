
import {shallow} from "enzyme";

import {Header} from '../../layout';
import {BaseHeader, mapStateToProps} from '../../layout/header';
import {
    ActionClear,
    ActionLoad, ActionSave} from '../../shared/actions';


test('Header is wrapped', () => {
    expect(Header.WrappedComponent).toEqual(BaseHeader);
});


test('Header mapStateToProps', () => {
    const version = {version: 'VERSION23'};
    const meta = {value: {version}};
    expect(mapStateToProps({meta})).toEqual({version});
});


test('Header render', () => {
    const header = shallow(<BaseHeader version='VERSION' />);
    expect(header.text()).toEqual(
        'Envoy playground (VERSION)<ActionClear /><ActionLoad /><ActionSave />');
    const img = header.find('img');
    expect(img.props()).toEqual(
        {"alt": "Envoy logo",
         "className": "ml-1 mr-2",
         "src": "envoy.svg",
         "width": "28px"});
    const span = header.find('span');
    expect(span.props()).toEqual(
        {"children": ["Envoy playground (", "VERSION", ")"]});
    const clear = header.find(ActionClear);
    expect(clear.props()).toEqual({});
    const load = header.find(ActionLoad);
    expect(load.props()).toEqual({});
    const save = header.find(ActionSave);
    expect(save.props()).toEqual({});
});
