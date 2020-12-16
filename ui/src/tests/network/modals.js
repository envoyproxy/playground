
import React from 'react';

import {shallow} from "enzyme";

import {BaseNetworkFormModal} from '../../network/modals';
import {PlaygroundFormModal} from '../../shared/modal';


test('NetworkFormModal render', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const proxies = {
        PROXY1: 'PROXYFOO',
        PROXY2: 'PROXYBAR'};
    const services = {
        SERVICE1: 'SERVICEFOO',
        SERVICE2: 'SERVICEBAR'};
    const form = {};
    const modal = shallow(
        <BaseNetworkFormModal
          form={form}
          dispatch={dispatch}
          proxies={proxies}
          services={services}
          onUpdate={onUpdate}
        />);
    expect(modal.text()).toEqual('');
    const formModal = modal.find(PlaygroundFormModal);
    expect(formModal.props()).toEqual({
        "icon": "cloud.svg",
        "messages": modal.instance().activityMessages,
        success: 'create',
        successTimeout: 1000,
        tabs: modal.instance().tabs});
});


test('NetworkFormModal activityMessages', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const proxies = {
        PROXY1: 'PROXYFOO',
        PROXY2: 'PROXYBAR'};
    const services = {
        SERVICE1: 'SERVICEFOO',
        SERVICE2: 'SERVICEBAR'};
    const form = {name: 'NETWORKNAME'};
    const modal = shallow(
        <BaseNetworkFormModal
          form={form}
          dispatch={dispatch}
          proxies={proxies}
          services={services}
          onUpdate={onUpdate}
        />);
    expect(Object.keys(modal.instance().activityMessages)).toEqual(['default', 'success']);
    expect(modal.instance().activityMessages.default[0]).toEqual([30, 100]);
    expect(modal.instance().activityMessages.default[1].type).toEqual('span');
    expect(modal.instance().activityMessages.default[1].props).toEqual(
        {"children": ["Creating network (", "NETWORKNAME", ")..."]});
    expect(modal.instance().activityMessages.success[0]).toEqual([100, 100]);
    expect(modal.instance().activityMessages.success[1].type).toEqual('span');
    expect(modal.instance().activityMessages.success[1].props).toEqual(
        {"children": ["Network created (", "NETWORKNAME", ")..."]});
});
