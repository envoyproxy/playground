
import React from 'react';

import {shallow} from "enzyme";

import {BaseServiceFormModal} from '../../service/modals';
import {PlaygroundFormModal} from '../../shared/modal';


test('ServiceFormModal render', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const service_types = {
        TYPE1: {icon: 'TYPE1ICON', name: 'SERVICETYPE1'},
        TYPE2: {icon: 'TYPE2ICON', name: 'SERVICETYPE2'}};
    const form = {
        errors: [],
        name: 'SERVICENAME'};
    const modal = shallow(
        <BaseServiceFormModal
          form={form}
          service_types={service_types}
          dispatch={dispatch}
          onUpdate={onUpdate}
        />);
    expect(modal.text()).toEqual('');
    const formModal = modal.find(PlaygroundFormModal);
    expect(formModal.props()).toEqual({
        icon: undefined,
        failMessage: modal.instance().failMessage,
        "messages": modal.instance().activityMessages,
        success: 'start',
        fail: ['exited', 'destroy', 'die'],
        tabs: modal.instance().tabs});
});


test('ServiceFormModal activityMessages', () => {
    const dispatch = jest.fn(async () => {});
    const onUpdate = jest.fn(async () => {});
    const form = {
        errors: {},
        service_type: 'TYPE1',
        name: 'SERVICENAME'};
    const service_types = {
        TYPE1: {icon: 'TYPE1ICON', name: 'SERVICETYPE1'},
        TYPE2: {icon: 'TYPE2ICON', name: 'SERVICETYPE2'}};
    const modal = shallow(
        <BaseServiceFormModal
          form={form}
          service_types={service_types}
          dispatch={dispatch}
          onUpdate={onUpdate}
        />);
    expect(Object.keys(modal.instance().activityMessages)).toEqual([
        'default',
        'pull_start',
        'volume_create',
        'start',
        'success']);

    const expected = {
        default: ['Creating service', [10, 30]],
        pull_start: ['Pulling container image for service', [30, 50]],
        volume_create: ['Creating volumes for service', [50, 70]],
        start: ['Starting service container', [70, 100]],
        success: ['Service has started', [100, 100]]};
    for (const [name, [text, progress]] of Object.entries(expected)) {
        const message = modal.instance().activityMessages[name];
        let ending = '...';
        if (progress[0] === 100) {
            ending = '!';
        }
        expect(message[0]).toEqual(progress);
        expect(message[1].type).toEqual('span');
        expect(message[1].props).toEqual(
            {"children": [text + " (", "SERVICENAME", ")" + ending]});
    }
});
