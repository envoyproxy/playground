
import React from 'react';
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import ProxyResources, {
    BaseProxyResources,
    mapStateToProps} from '../../proxy/resources';
import ProxyFormModal from '../../proxy/modals';
import APIResources from '../../shared/resources';


BaseProxyResources.contextTypes = {
    formatMessage: PropTypes.func.isRequired
};


test('ProxyResources render', () => {
    const dispatch = jest.fn();
    const proxies = {RES1: '', RES2: ''};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseProxyResources
          dispatch={dispatch}
          proxies={proxies}
        />, {context});
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('proxy');
    expect(api.props().logo).toEqual('envoy.svg');
    expect(api.props().title).toEqual('TITLE');
    expect(api.props().resources).toEqual(proxies);
    expect(api.props().addModal).toEqual({
        modal: ProxyFormModal,
        title: resources.instance().addModalTitle,
        action: 'TITLE'});
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Proxies",
           "id": "playground.resource.title.proxies"}],
         [{"defaultMessage": "Create proxy",
           "id": "playground.form.proxy.create.action.create"}]]);
});


test('ProxyResources addModalTitle', () => {
    const dispatch = jest.fn();
    const proxies = {RES1: '', RES2: ''};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseProxyResources
          dispatch={dispatch}
          proxies={proxies}
        />, {context});
    context.formatMessage.mockClear();
    expect(resources.instance().addModalTitle('NAME')).toEqual('TITLE');
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Create an Envoy proxy",
           "id": "playground.form.proxy.create.title"}]]);
});


test('ProxyResources mapStateToProps', () => {
    const state = {proxy: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({proxies: 'VALUE'});
});


test('ProxyResources isMapped', () => {
    expect(ProxyResources.WrappedComponent).toEqual(BaseProxyResources);
});
