
import React from 'react';

import {shallow} from "enzyme";

import ServiceResources, {
    BaseServiceResources,
    mapStateToProps} from '../../service/resources';
import {ServiceFormModal} from '../../service/modals';
import APIResources from '../../shared/resources';


test('ServiceResources render', () => {
    const dispatch = jest.fn();
    const services = {RES1: '', RES2: ''};
    const service_types = {TYPE1: '', TYPE2: ''};
    const resources = shallow(
        <BaseServiceResources
          dispatch={dispatch}
          services={services}
          service_types={service_types}
        />);
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('service');
    expect(api.props().logo).toEqual(resources.instance().getLogo);
    expect(api.props().title).toEqual('Services');
    expect(api.props().resources).toEqual(services);
    expect(api.props().addModal).toEqual({
        modal: ServiceFormModal,
        title: resources.instance().addModalTitle,
        action: 'Create service'});
});


test('ServiceResources addModalTitle', () => {
    const dispatch = jest.fn();
    const services = {RES1: '', RES2: ''};
    const service_types = {TYPE1: {value: 't1'}, TYPE2: {value: 't2'}};
    const resources = shallow(
        <BaseServiceResources
          dispatch={dispatch}
          services={services}
          service_types={service_types}
        />);
    expect(resources.instance().addModalTitle('NAME')).toEqual('Create a service');
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
    expect(ServiceResources._stateMapper).toEqual(mapStateToProps);
});
