
import React from 'react';

import {shallow} from "enzyme";

import {BaseProxyFormModal} from '../../proxy/modals';
import {PlaygroundFormModal} from '../../shared/modal';


test('ProxyFormModal render', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const form = {};
    const modal = shallow(
        <BaseProxyFormModal
          form={form}
          dispatch={dispatch}
          onUpdate={onUpdate}
        />);
    expect(modal.text()).toEqual('');
    const formModal = modal.find(PlaygroundFormModal);
    expect(formModal.props()).toEqual({
        "icon": "envoy.svg",
        "messages": modal.instance().activityMessages,
        success: 'start',
        fail: ['exited', 'destroy', 'die'],
        failMessage: modal.instance().failMessage,
        tabs: modal.instance().tabs});
});


test('ProxyFormModal activityMessages', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const form = {name: 'PROXYNAME'};
    const modal = shallow(
        <BaseProxyFormModal
          form={form}
          dispatch={dispatch}
          onUpdate={onUpdate}
        />);
    expect(Object.keys(modal.instance().activityMessages)).toEqual([
        'default',
        'pull_start',
        'build_start',
        'volume_create',
        'start',
        'success']);
    expect(modal.instance().activityMessages.default[0]).toEqual([10, 20]);
    expect(modal.instance().activityMessages.default[1].type).toEqual('span');
    expect(modal.instance().activityMessages.default[1].props).toEqual(
        {"children": ["Creating Envoy proxy (", "PROXYNAME", ")..."]});

    expect(modal.instance().activityMessages.pull_start[0]).toEqual([20, 50]);
    expect(modal.instance().activityMessages.pull_start[1].type).toEqual('span');
    expect(modal.instance().activityMessages.pull_start[1].props).toEqual(
        {"children": ["Pulling container image for Envoy proxy (", "PROXYNAME", ")..."]});

    expect(modal.instance().activityMessages.build_start[0]).toEqual([50, 80]);
    expect(modal.instance().activityMessages.build_start[1].type).toEqual('span');
    expect(modal.instance().activityMessages.build_start[1].props).toEqual(
        {"children": ["Building container image for Envoy proxy (", "PROXYNAME", ")..."]});

    expect(modal.instance().activityMessages.volume_create[0]).toEqual([80, 90]);
    expect(modal.instance().activityMessages.volume_create[1].type).toEqual('span');
    expect(modal.instance().activityMessages.volume_create[1].props).toEqual(
        {"children": ["Creating volumes for Envoy proxy (", "PROXYNAME", ")..."]});

    expect(modal.instance().activityMessages.start[0]).toEqual([90, 100]);
    expect(modal.instance().activityMessages.start[1].type).toEqual('span');
    expect(modal.instance().activityMessages.start[1].props).toEqual(
        {"children": ["Starting Envoy proxy container (", "PROXYNAME", ")..."]});

    expect(modal.instance().activityMessages.success[0]).toEqual([100, 100]);
    expect(modal.instance().activityMessages.success[1].type).toEqual('span');
    expect(modal.instance().activityMessages.success[1].props).toEqual(
        {"children": ["Envoy proxy has started (", "PROXYNAME", ")!"]});
});
