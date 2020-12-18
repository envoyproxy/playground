
import React from 'react';
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import ServiceLogo from '../../app/images/service.png';
import ServiceResources, {
    BaseServiceResources,
    mapStateToProps} from '../../service/resources';
import ServiceFormModal from '../../service/modals';
import APIResources from '../../shared/resources';


BaseServiceResources.contextTypes = {
    formatMessage: PropTypes.func.isRequired
};


test('ServiceResources render', () => {
    const dispatch = jest.fn();
    const services = {RES1: '', RES2: ''};
    const service_types = {TYPE1: '', TYPE2: ''};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseServiceResources
          dispatch={dispatch}
          services={services}
          service_types={service_types}
        />, {context});
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('service');
    expect(api.props().logo).toEqual(resources.instance().getLogo);
    expect(api.props().title).toEqual('TITLE');
    expect(api.props().resources).toEqual(services);
    expect(api.props().addModal).toEqual({
        modal: ServiceFormModal,
        title: resources.instance().addModalTitle,
        action: 'TITLE'});
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Services",
           "id": "playground.resource.title.services"}],
         [{"defaultMessage": "Create service",
           "id": "playground.form.service.create.action.create"}]]);
});


test('ServiceResources addModalTitle', () => {
    const dispatch = jest.fn();
    const services = {RES1: '', RES2: ''};
    const service_types = {TYPE1: {value: 't1'}, TYPE2: {value: 't2'}};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseServiceResources
          dispatch={dispatch}
          services={services}
          service_types={service_types}
        />, {context});
    context.formatMessage.mockClear();
    expect(resources.instance().addModalTitle('NAME')).toEqual('TITLE');
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Create a service",
           "id": "playground.form.service.create.title"}]]);
});


test('ServiceResources getLogo', () => {
    const dispatch = jest.fn();
    const services = {RES1: '', RES2: ''};
    const service_types = {TYPE1: {icon: 'ICON1'}, TYPE2: {icon: 'ICON2'}};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseServiceResources
          dispatch={dispatch}
          services={services}
          service_types={service_types}
        />, {context});
    expect(resources.instance().getLogo()).toEqual(ServiceLogo);
    expect(resources.instance().getLogo('FOO')).toEqual();
    expect(resources.instance().getLogo('TYPE2')).toEqual('ICON2');
});


test('ServiceResources mapStateToProps', () => {
    const state = {
        service_type: {value: 'SERVICE TYPES VALUE'},
        service: {value: 'SERVICE VALUE'}};
    expect(mapStateToProps(state)).toEqual({
        service_types: 'SERVICE TYPES VALUE',
        services: 'SERVICE VALUE'});
});


test('ServiceResources isMapped', () => {
    expect(ServiceResources.WrappedComponent).toEqual(BaseServiceResources);
});
