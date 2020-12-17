
import React from 'react';

import {shallow} from "enzyme";

import each from 'jest-each';

import {BaseServiceFormModal} from '../../service/modals';
import {PlaygroundFormModal} from '../../shared/modal';


const _renderModal = (form) => {
    const dispatch = jest.fn(async () => {});
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
            },
        }};
    return shallow(
        <BaseServiceFormModal
          form={form}
          service_types={service_types}
          dispatch={dispatch}
        />);
};

test('ServiceFormModal render', () => {
    const form = {
        errors: [],
        name: 'SERVICENAME'};
    const modal = _renderModal(form);
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
    const form = {
        errors: {},
        service_type: 'TYPE1',
        name: 'SERVICENAME'};
    const modal = _renderModal(form);
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


const tabsTest = [
    [{errors: {}, name: 'a'}],
    [{errors: {}, name: 'ab'}],
    [{errors: {}, name: 'abc'}],
];


each(tabsTest).test('ServiceFormModal tabs', (form) => {
    const modal = _renderModal(form);
    const tabs = {Service: modal.instance().tabService};
    const {errors={}, name, service_type} = form;
    const isValid = (!errors.name && name.length > 2 && service_type);
    if (isValid) {
    }
    expect(modal.instance().tabs).toEqual(tabs);
});
