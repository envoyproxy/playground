
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {updateForm} from '../../../app/store';
import {
    PlaygroundForm,
    PlaygroundNameInput,
    PlaygroundSelectInput} from '../../../shared/forms';
import ServiceForm, {
    mapStateToProps, BaseServiceForm} from '../../../service/forms/service';

BaseServiceForm.contextTypes = {
    validators: PropTypes.object.isRequired};


jest.mock('../../../app/store', () => {
    return {updateForm: jest.fn()};
});


const service_types = {
    TYPE1: {
        icon: 'TYPE1ICON',
        name: 'SERVICETYPE1',
        image: 'TYPE1 image',
        labels: {
            'envoy.playground.service': 'TYPE1',
            'envoy.playground.description': 'TYPE1 description',
            'envoy.playground.readme': 'TYPE1 README',
            'envoy.playground.logo': 'TYPE1 LOGO',
            'envoy.playground.ports': 23,
        },
    },
    TYPE2: {
        icon: 'TYPE2ICON',
        name: 'SERVICETYPE2',
        image: 'TYPE2 image',
        labels: {
            'envoy.playground.service': 'TYPE2',
            'envoy.playground.description': 'TYPE2 description',
            'envoy.playground.readme': 'TYPE2 README',
            'envoy.playground.logo': 'TYPE2 LOGO',
            'envoy.playground.config.path': 'TYPE2 CONFIG',
            'envoy.playground.ports': '73,113',
        },
    }};


test('ServiceForm render', () => {
    const dispatch = jest.fn(async () => {});
    const _form = {service_type: 'TYPE1'};
    const context  = {validators: {name: jest.fn()}};
    let form = shallow(
        <BaseServiceForm
          service_types={service_types}
          services={{SERVICE1: 'service 1'}}
          dispatch={dispatch}
          form={_form} />,
        {context});
    expect(form.text()).toEqual('<PlaygroundForm />');
    expect(form.instance().messages).toEqual(
        ["Select a service type below, and give the service a name"]);
    expect (form.instance().groups).toEqual([
        [{"cols": [
            [9,
             <PlaygroundNameInput
               errors={{}}
               onChange={form.instance().onNameChange}
               placeholder="Enter service name"
               taken={["SERVICE1"]} />]],
          "label": "name",
          "title": "Name*"}],
        [{title: 'Service type',
          label: 'service_type',
          cols: [
              [9,
               <PlaygroundSelectInput
                 name="service_type"
                 value="TYPE1"
                 onChange={form.instance().onTypeChange}
                 placeholder="Select a service type"
                 options={form.instance().serviceOptions}
               />]]}]]);
    const playgroundForm = form.find(PlaygroundForm);
    expect (playgroundForm.props().groups).toEqual(form.instance().groups);
    expect (playgroundForm.props().messages).toEqual(form.instance().messages);
});


test('ServiceForm onNameChange', async () => {
    updateForm.mockImplementation(() => 'UPDATED');
    const dispatch = jest.fn(async () => {});
    const _form = {KEY: 'VALUE'};
    const context  = {validators: {name: jest.fn()}};
    let form = shallow(
        <BaseServiceForm
          service_types={service_types}
          services={{SERVICE1: 'service 1'}}
          dispatch={dispatch}
          form={_form} />,
        {context});
    let event = {name: "NAME", errors: 'ERRORS'};
    await form.instance().onNameChange(event);
    expect(updateForm.mock.calls).toEqual([[{
        "errors": "ERRORS",
        "name": "NAME",
        "service_type": undefined,
        "valid": false,
    }]]);
    expect(dispatch.mock.calls).toEqual([['UPDATED']]);

    dispatch.mockClear();
    updateForm.mockClear();
    event = {name: "NAME", errors: 'ERRORS', valid: true};
    await form.instance().onNameChange(event);
    expect(updateForm.mock.calls).toEqual([[{
        "errors": "ERRORS",
        "name": "NAME",
        "service_type": undefined,
        "valid": false,
    }]]);

    dispatch.mockClear();
    updateForm.mockClear();
    form.setProps({
        form: {service_type: 'TYPE1'}});
    event = {name: "NAME", valid: true};
    await form.instance().onNameChange(event);
    expect(updateForm.mock.calls).toEqual([[{
        "name": "NAME",
        "service_type": 'TYPE1',
        "valid": true,
    }]]);

    dispatch.mockClear();
    updateForm.mockClear();
    form.setProps({
        form: {service_type: 'TYPE1'}});
    event = {name: "NAME", valid: false};
    await form.instance().onNameChange(event);
    expect(updateForm.mock.calls).toEqual([[{
        "name": "NAME",
        "service_type": 'TYPE1',
        "valid": false,
    }]]);

});


test('ServiceFormModal mapStateToProps', () => {
    const state = {
        form: {value: 'FORM'},
        service_type: {value: 'SERVICE TYPES'},
        service: {value: 'SERVICES'}};
    expect(mapStateToProps(state)).toEqual({
        form: 'FORM',
        service_types: 'SERVICE TYPES',
        services: 'SERVICES'});
});


test('ServiceForm isWrapped', () => {
    expect(ServiceForm.WrappedComponent).toEqual(BaseServiceForm);
});
