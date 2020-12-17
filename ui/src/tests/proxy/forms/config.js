
import {shallow} from "enzyme";

import {updateForm} from '../../../app/store';
import {BaseProxyConfigForm} from '../../../proxy/forms/config';
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
