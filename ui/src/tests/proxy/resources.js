
import React from 'react';

import {shallow} from "enzyme";

import ProxyResources, {
    BaseProxyResources,
    mapStateToProps} from '../../proxy/resources';
import ProxyFormModal from '../../proxy/modals';
import APIResources from '../../shared/resources';


test('ProxyResources render', () => {
    const dispatch = jest.fn();
    const proxies = {RES1: '', RES2: ''};
    const resources = shallow(
        <BaseProxyResources
          dispatch={dispatch}
          proxies={proxies}
        />);
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('proxy');
    expect(api.props().logo).toEqual('envoy.svg');
    expect(api.props().title).toEqual('Proxies');
    expect(api.props().resources).toEqual(proxies);
    expect(api.props().addModal).toEqual({
        modal: ProxyFormModal,
        title: resources.instance().addModalTitle,
        action: 'Create proxy'});
});


test('ProxyResources addModalTitle', () => {
    const dispatch = jest.fn();
    const proxies = {RES1: '', RES2: ''};
    const resources = shallow(
        <BaseProxyResources
          dispatch={dispatch}
          proxies={proxies}
        />);
    expect(resources.instance().addModalTitle('NAME')).toEqual('Create an Envoy proxy');
});


test('ProxyResources mapStateToProps', () => {
    const state = {proxy: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({proxies: 'VALUE'});
});


test('ProxyResources isMapped', () => {
    expect(ProxyResources.WrappedComponent).toEqual(BaseProxyResources);
});
