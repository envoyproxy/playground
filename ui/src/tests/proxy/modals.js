
import React from 'react';

import {shallow} from "enzyme";

import each from 'jest-each';

import {PlaygroundFormModal} from '../../shared/modal';
import ProxyFormModal, {
    BaseProxyFormModal, mapStateToProps} from '../../proxy/modals';
import {
    ProxyBinariesForm, ProxyLoggingForm,
    ProxyForm, ProxyCertificatesForm,
    ProxyPortsForm} from '../../proxy/forms';


const _renderModal = (form) => {
    const dispatch = jest.fn(async () => {});
    return shallow(
        <BaseProxyFormModal
          form={form}
          dispatch={dispatch}
        />);
};


test('ProxyFormModal render', () => {
    const form = {errors: {}};
    const modal = _renderModal(form);
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
    const form = {
        name: 'PROXYNAME',
        errors: {}};
    const modal = _renderModal(form);
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


const tabsTest = [
    [{errors: {}, name: 'a'}],
    [{errors: {}, name: 'ab'}],
    [{errors: {name: 'X'}, name: 'abc'}],
    [{errors: {}, name: 'abc'}],
    [{errors: {}, name: 'abcd'}],
];


each(tabsTest).test('ProxyFormModal tabs', (form) => {
    const modal = _renderModal(form);
    let tabs = {Proxy: <ProxyForm />};
    const {errors={}, name} = form;
    const isValid = (!errors.name && name.length > 2);
    if (isValid) {
        tabs = {
            ...tabs,
            ...{Logging: <ProxyLoggingForm />,
                Ports: <ProxyPortsForm />,
                Certificates: <ProxyCertificatesForm />,
                Binaries: <ProxyBinariesForm />}};
    }
    expect(modal.instance().tabs).toEqual(tabs);
});


test('ProxyFormModal mapStateToProps', () => {
    const state = {
        form: {value: 'FORM'}};
    expect(mapStateToProps(state)).toEqual({
        form: 'FORM'});
});


test('ProxyFormModal isWrapped', () => {
    expect(ProxyFormModal.WrappedComponent).toEqual(BaseProxyFormModal);
});
