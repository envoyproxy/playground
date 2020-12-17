
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {ProxyVersionField} from '../../../proxy/forms/version';
import {PlaygroundSelectInput} from '../../../shared/forms/fields';


ProxyVersionField.contextTypes = {
    versions:  PropTypes.array.isRequired};


test('ProxyVersionField render', () => {
    const onChange = jest.fn();
    const context = {versions: ['A', 'B', 'C']};
    let form = shallow(
        <ProxyVersionField
          onChange={onChange}
        />, {context});
    expect(form.text()).toEqual('<PlaygroundSelectInput />');
    const select = form.find(PlaygroundSelectInput);
    expect(select.props()).toEqual({
        "name": "mapping_type",
        "onChange": onChange,
        "options": ["A", "B", "C"],
        "placeholder": "Version (optional)",
        "value": undefined});
});


test('ProxyVersionField render version', () => {
    const onChange = jest.fn();
    const context = {versions: ['A', 'B', 'C']};
    let form = shallow(
        <ProxyVersionField
          version="23"
          onChange={onChange}
        />, {context});
    expect(form.text()).toEqual('<PlaygroundSelectInput />');
    const select = form.find(PlaygroundSelectInput);
    expect(select.props()).toEqual({
        "name": "mapping_type",
        "onChange": onChange,
        "options": ["A", "B", "C"],
        "placeholder": "Version (optional)",
        "value": "23"});
});
