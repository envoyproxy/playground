
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {updateForm} from '../../../app/store';
import {
    PlaygroundForm, PlaygroundNameInput} from '../../../shared/forms';
import NetworkForm, {
    mapStateToProps, BaseNetworkForm} from '../../../network/forms/network';

BaseNetworkForm.contextTypes = {
    validators: PropTypes.object.isRequired};


jest.mock('../../../app/store', () => {
    return {updateForm: jest.fn()};
});


test('NetworkForm render', () => {
    const dispatch = jest.fn(async () => {});
    const _form = {KEY: 'VALUE'};
    const context  = {validators: {name: jest.fn()}};
    let form = shallow(
        <BaseNetworkForm
          networks={{NET1: 'network 1'}}
          dispatch={dispatch}
          form={_form} />,
        {context});
    expect(form.text()).toEqual('<PlaygroundForm />');
    expect(form.instance().messages).toEqual(
        ["Add a named network. You can add proxies and services to the network."]);
    expect (form.instance().groups).toEqual([[{
        "cols": [[9,
                  <PlaygroundNameInput
                    errors={{}}
                    onChange={form.instance().onNameChange}
                    placeholder="Enter network name"
                    taken={["NET1"]} />]],
        "label": "name",
        "title": "Name*"}]]);
    const playgroundForm = form.find(PlaygroundForm);
    expect (playgroundForm.props().groups).toEqual(form.instance().groups);
    expect (playgroundForm.props().messages).toEqual(form.instance().messages);
});


test('NetworkForm onNameChange', async () => {
    updateForm.mockImplementation(() => 'UPDATED');
    const dispatch = jest.fn(async () => {});
    const _form = {KEY: 'VALUE'};
    const context  = {validators: {name: jest.fn()}};
    let form = shallow(
        <BaseNetworkForm
          networks={{NET1: 'network 1'}}
          dispatch={dispatch}
          form={_form} />,
        {context});
    await form.instance().onNameChange('EVENT');
    expect(updateForm.mock.calls).toEqual([['EVENT']]);
    expect(dispatch.mock.calls).toEqual([['UPDATED']]);
});


test('NetworkFormModal mapStateToProps', () => {
    const state = {
        form: {value: 'FORM'},
        network: {value: 'NETWORKS'}};
    expect(mapStateToProps(state)).toEqual({
        form: 'FORM',
        networks: 'NETWORKS'});
});


test('NetworkForm isWrapped', () => {
    expect(NetworkForm.WrappedComponent).toEqual(BaseNetworkForm);
});
