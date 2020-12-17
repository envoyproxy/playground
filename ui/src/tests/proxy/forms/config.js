
import {shallow} from "enzyme";

import {updateForm} from '../../../app/store';
import ProxyConfigForm, {
    mapStateToProps, BaseProxyConfigForm} from '../../../proxy/forms/config';
import {PlaygroundEditor} from '../../../shared/editor';


const code =
`static_resources:
  clusters:
    ...
  listeners:
    ...
`;


jest.mock('../../../app/store', () => {
    return {updateForm: jest.fn()};
});


test('ProxyConfigForm render', () => {
    const dispatch = jest.fn();
    const onChange = jest.fn();
    const _form = {errors: {}};
    const examples = {envoy: {example: 'INFO'}};
    let form = shallow(
        <BaseProxyConfigForm
          examples={examples}
          form={_form}
          dispatch={dispatch}
          onChange={onChange}
        />);
    expect(form.text()).toEqual('<PlaygroundEditor />');
    const editor = form.find(PlaygroundEditor);
    expect(editor.props()).toEqual({
        title: "Configuration*",
        name: "configuration",
        content: code,
        format: "yaml",
        examples: examples.envoy,
        clearConfig: form.instance().clearConfig,
        onChange: onChange,
        onExampleSelect: form.instance().onExampleSelect,
        errors: []});
});

test('ProxyConfigForm render bad form', () => {
    const dispatch = jest.fn();
    const onChange = jest.fn();
    const _form = {
        configuration: 'BAD',
        errors: {configuration: ['EEK']}};
    const examples = {envoy: {example: 'INFO'}};
    let form = shallow(
        <BaseProxyConfigForm
          examples={examples}
          form={_form}
          dispatch={dispatch}
          onChange={onChange}
        />);
    expect(form.text()).toEqual('<PlaygroundEditor />');
    const editor = form.find(PlaygroundEditor);
    expect(editor.props()).toEqual({
        title: "Configuration*",
        name: "configuration",
        content: 'BAD',
        format: "yaml",
        examples: examples.envoy,
        clearConfig: form.instance().clearConfig,
        onChange: onChange,
        onExampleSelect: form.instance().onExampleSelect,
        errors: ['EEK']});
});


test('ProxyConfigForm clearConfig', async () => {
    updateForm.mockImplementation(() => 'UPDATED CONFIG');
    const dispatch = jest.fn();
    const onChange = jest.fn();
    const _form = {errors: {}};
    const examples = {envoy: {example: 'INFO'}};
    let form = shallow(
        <BaseProxyConfigForm
          examples={examples}
          form={_form}
          dispatch={dispatch}
          onChange={onChange}
        />);

    await form.instance().clearConfig();
    expect(updateForm.mock.calls).toEqual([[{configuration: ''}]]);
    expect(dispatch.mock.calls).toEqual([['UPDATED CONFIG']]);
});


test('ProxyConfigForm onExampleSelect', async () => {
    const _fetch = global.fetch;
    global.fetch = jest.fn(async () => ({text: jest.fn(async () => 'FETCHED CONFIG')}));
    updateForm.mockImplementation(() => 'UPDATED EXAMPLE CONFIG');
    const dispatch = jest.fn();
    const onChange = jest.fn();
    const _form = {errors: {FOO: 'BAR'}};
    const examples = {envoy: {example: {path: 'PATH'}}};
    let form = shallow(
        <BaseProxyConfigForm
          examples={examples}
          form={_form}
          dispatch={dispatch}
          onChange={onChange}
          configWarning="OH NOES!"
        />);

    await form.instance().onExampleSelect({target: {}});
    expect(global.fetch.mock.calls).toEqual([]);
    expect(dispatch.mock.calls).toEqual([['UPDATED EXAMPLE CONFIG']]);
    expect(updateForm.mock.calls).toEqual([[{
        valid: false,
        warning: 'OH NOES!',
        configuration: code}]]);

    dispatch.mockClear();
    updateForm.mockClear();
    await form.instance().onExampleSelect({target: {value: 'FOO'}});
    expect(dispatch.mock.calls).toEqual([['UPDATED EXAMPLE CONFIG']]);
    expect(global.fetch.mock.calls).toEqual([]);
    expect(updateForm.mock.calls).toEqual([[{
        valid: false,
        warning: 'OH NOES!',
        configuration: code}]]);

    dispatch.mockClear();
    updateForm.mockClear();
    await form.instance().onExampleSelect({target: {value: 'example'}});
    expect(dispatch.mock.calls).toEqual([['UPDATED EXAMPLE CONFIG']]);
    expect(updateForm.mock.calls).toEqual([[{
        valid: true,
        errors: {FOO: 'BAR'},
        warning: undefined,
        configuration: 'FETCHED CONFIG'}]]);
    expect(global.fetch.mock.calls).toEqual([['PATH']]);

    global.fetch = _fetch;
});


test('ProxyConfigFormModal mapStateToProps', () => {
    const state = {
        form: {value: 'FORM'},
        example: {value: 'EXAMPLES'}};
    expect(mapStateToProps(state)).toEqual({
        form: 'FORM',
        examples: 'EXAMPLES'});
});


test('ProxyConfigForm isWrapped', () => {
    expect(ProxyConfigForm.WrappedComponent).toEqual(BaseProxyConfigForm);
});
