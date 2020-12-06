
import {shallow} from "enzyme";

import {Col} from 'reactstrap';

import {updateForm} from '../../../app/store';
import {
    ProxyLoggingForm, ProxyLoggingDefaultField} from '../../../proxy/forms/logging';
import {
    PlaygroundFormGroup, PlaygroundFormGroupRow} from '../../../shared/forms';
import {
    PlaygroundSelectInput} from '../../../shared/forms/fields/input';
import BinaryIcon from '../../../app/images/binary.png';


jest.mock('../../../app/store', () => {
    return {updateForm: jest.fn()};
});


test('ProxyLoggingForm render', () => {
    const dispatch = jest.fn(async () => {});
    const _form = {KEY: 'VALUE'};
    let form = shallow(
        <ProxyLoggingForm
          dispatch={dispatch}
          form={_form} />);
    expect(form.text()).toEqual('<PlaygroundForm />');
    expect(form.props().messages).toEqual(
        ["Select a log level for your proxy."]);
    const defaultField = form.find(ProxyLoggingDefaultField);
    expect(defaultField.props().logging).toEqual({});
    expect(defaultField.props().onChange).toEqual(form.instance().onChange);
});


test('ProxyLoggingForm onChange', async () => {
    updateForm.mockImplementation(() => 'STATE');
    const dispatch = jest.fn(async () => {});
    const _form = {logging: {KEY: 'VALUE'}};
    let form = shallow(
        <ProxyLoggingForm
          dispatch={dispatch}
          form={_form} />);
    await form.instance().onChange({target: {value: 'VALUE'}});
    expect(updateForm.mock.calls).toEqual([
        [{"logging": {"KEY": "VALUE", "default": "VALUE"}}]]);
    expect(dispatch.mock.calls).toEqual([['STATE']]);
});


test('ProxyLoggingDefaultField render', () => {
    const onChange = jest.fn(async () => {});
    const _logging = {'default': 'LOGLEVEL'};
    let logging = shallow(
        <ProxyLoggingDefaultField
          onChange={onChange}
          logging={_logging} />);
    expect(logging.text()).toEqual('<PlaygroundFormGroupRow />');
    expect(logging.props().label).toEqual('log_level');
    expect(logging.props().title).toEqual('Default log level');
    const col = logging.find(Col);
    expect(col.props().sm).toEqual(8);
    const input = col.find(PlaygroundSelectInput);
    expect(input.props().value).toEqual('LOGLEVEL');
    expect(input.props().onChange).toEqual(onChange);
});
