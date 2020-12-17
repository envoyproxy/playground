
import React from 'react';

import {shallow} from "enzyme";

import {BaseProxyFormModal} from '../../proxy/modals';
import {PlaygroundFormModal} from '../../shared/modal';


test('ProxyFormModal render', () => {
    const dispatch = jest.fn(async () => {});
    const form = {};
    const modal = shallow(
        <BaseProxyFormModal
          form={form}
          dispatch={dispatch}
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
    const form = {name: 'PROXYNAME'};
    const modal = shallow(
        <BaseProxyFormModal
          form={form}
          dispatch={dispatch}
        />);
    expect(Object.keys(modal.instance().activityMessages)).toEqual([
        'default',
        'pull_start',
        'build_start',
        'volume_create',
        'start',
        'success']);

    const expected = {
        default: ['Creating Envoy proxy', [10, 20]],
        pull_start: ['Pulling container image for Envoy proxy', [20, 50]],
        build_start: ['Building container image for Envoy proxy', [50, 80]],
        volume_create: ['Creating volumes for Envoy proxy', [80, 90]],
        start: ['Starting Envoy proxy container', [90, 100]],
        success: ['Envoy proxy has started', [100, 100]]};
    for (const [name, [text, progress]] of Object.entries(expected)) {
        const message = modal.instance().activityMessages[name];
        let ending = '...';
        if (progress[0] === 100) {
            ending = '!';
        }
        expect(message[0]).toEqual(progress);
        expect(message[1].type).toEqual('span');
        expect(message[1].props).toEqual(
            {"children": [text + " (", "PROXYNAME", ")" + ending]});
    }
});
