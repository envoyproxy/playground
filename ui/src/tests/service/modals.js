
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
    const form = {};
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
        errors: [],
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
    expect(modal.instance().activityMessages.default[0]).toEqual([10, 30]);
    expect(modal.instance().activityMessages.default[1].type).toEqual('span');
    expect(modal.instance().activityMessages.default[1].props).toEqual(
        {"children": ["Creating service (", "SERVICENAME", ")..."]});

    expect(modal.instance().activityMessages.pull_start[0]).toEqual([30, 50]);
    expect(modal.instance().activityMessages.pull_start[1].type).toEqual('span');
    expect(modal.instance().activityMessages.pull_start[1].props).toEqual(
        {"children": ["Pulling container image for service (", "SERVICENAME", ")..."]});

    expect(modal.instance().activityMessages.volume_create[0]).toEqual([50, 70]);
    expect(modal.instance().activityMessages.volume_create[1].type).toEqual('span');
    expect(modal.instance().activityMessages.volume_create[1].props).toEqual(
        {"children": ["Creating volumes for service (", "SERVICENAME", ")..."]});

    expect(modal.instance().activityMessages.start[0]).toEqual([70, 100]);
    expect(modal.instance().activityMessages.start[1].type).toEqual('span');
    expect(modal.instance().activityMessages.start[1].props).toEqual(
        {"children": ["Starting service container (", "SERVICENAME", ")..."]});

    expect(modal.instance().activityMessages.success[0]).toEqual([100, 100]);
    expect(modal.instance().activityMessages.success[1].type).toEqual('span');
    expect(modal.instance().activityMessages.success[1].props).toEqual(
        {"children": ["Service has started (", "SERVICENAME", ")!"]});
});
