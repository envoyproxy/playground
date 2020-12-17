
import React from 'react';

import {shallow} from "enzyme";

import each from 'jest-each';

import NetworkFormModal, {
    BaseNetworkFormModal,
    mapStateToProps} from '../../network/modals';
import {PlaygroundFormModal} from '../../shared/modal';
import {NetworkForm, NetworkConnectionsForm} from '../../network/forms';


const _renderModal = (form, proxies, services) => {
    const dispatch = jest.fn(async () => {});
    const _proxies = {
        PROXY1: 'PROXYFOO',
        PROXY2: 'PROXYBAR'};
    const _services = {
        SERVICE1: 'SERVICEFOO',
        SERVICE2: 'SERVICEBAR'};
    return shallow(
        <BaseNetworkFormModal
          form={form || {}}
          dispatch={dispatch}
          proxies={proxies || _proxies}
          services={services || _services}
        />);
};


test('NetworkFormModal render', () => {
    const modal = _renderModal();
    expect(modal.text()).toEqual('');
    const formModal = modal.find(PlaygroundFormModal);
    expect(formModal.props()).toEqual({
        "icon": "cloud.svg",
        "messages": modal.instance().activityMessages,
        success: 'create',
        successTimeout: 1000,
        tabs: modal.instance().tabs});
    expect(modal.instance().messages).toEqual({
        "proxies": ["Add and remove proxies from this network"],
        "services": ["Add and remove services from this network"]});
});


test('NetworkFormModal activityMessages', () => {
    const form = {name: 'NETWORKNAME'};
    const modal = _renderModal(form);
    const expected = {
        default: ['Creating network', [30, 100]],
        success: ['Network created', [100, 100]]};
    for (const [name, [text, progress]] of Object.entries(expected)) {
        const message = modal.instance().activityMessages[name];
        let ending = '...';
        if (progress[0] === 100) {
            ending = '!';
        }
        expect(message[0]).toEqual(progress);
        expect(message[1].type).toEqual('span');
        expect(message[1].props).toEqual(
            {"children": [text + " (", "NETWORKNAME", ")" + ending]});
    }
});


const tabsTest = [
    [{errors: {}, name: 'a', proxies: [], services: []}, {}, {}],
    [{errors: {}, name: 'ab', proxies: [], services: []}, {}, {}],
    [{errors: {}, name: 'abc', proxies: [], services: []}, {}, {}],
    [{errors: {name: 'X'}, name: 'abc', proxies: [], services: []}, {}, {}],
    [{errors: {}, name: 'abc', proxies: [], services: []},
     {P1: 'PFOO', P2: 'PBAR'}, {}],
    [{errors: {}, name: 'abc', proxies: ['PFOO'], services: []},
     {P1: 'PFOO', P2: 'PBAR'}, {}],
    [{errors: {}, name: 'abc', proxies: ['PFOO', 'PBAR'], services: []},
     {P1: 'PFOO', P2: 'PBAR'}, {}],
    [{errors: {}, name: 'abc', proxies: [], services: []}, {},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {}, name: 'abc', proxies: [], services: ['SFOO']}, {},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {}, name: 'abc', proxies: [], services: ['SFOO', 'SBAR']}, {},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {name: 'X'}, name: 'abc', proxies: [], services: ['SFOO', 'SBAR']}, {},
     {S1: 'SFOO', S2: 'SBAR'}],

    [{errors: {}, name: 'abc', proxies: [], services: []},
     {P1: 'PFOO', P2: 'PBAR'},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {}, name: 'abc', proxies: ['PFOO'], services: []},
     {P1: 'PFOO', P2: 'PBAR'},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {}, name: 'abc', proxies: ['PFOO', 'PBAR'], services: []},
     {P1: 'PFOO', P2: 'PBAR'},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {}, name: 'abc', proxies: ['PFOO', 'PBAR'], services: ['SFOO', 'SBAR']},
     {P1: 'PFOO', P2: 'PBAR'},
     {S1: 'SFOO', S2: 'SBAR'}],
    [{errors: {name: 'X'}, name: 'abc', proxies: ['PFOO', 'PBAR'], services: ['SFOO', 'SBAR']},
     {P1: 'PFOO', P2: 'PBAR'},
     {S1: 'SFOO', S2: 'SBAR'}],
];


each(tabsTest).test('NetworkFormModal tabs', (form, proxies, services) => {
    const modal = _renderModal(form, proxies, services);
    const tabs = {Network: <NetworkForm />};
    const {errors={}, name, proxies: cProxies, services: cServices} = form;
    const isValid = (!errors.name && name.length > 2);
    if (isValid && Object.keys(proxies).length > 0) {
        const tabTitle = 'Proxies (' + cProxies.length + '/' + Object.keys(proxies).length + ')';
        tabs[tabTitle] = (
            <NetworkConnectionsForm
              messages={modal.instance().messages.proxies}
              type="proxies"
            />);
    }
    if (isValid && Object.keys(services).length > 0) {
        const tabTitle = 'Services (' + cServices.length + '/' + Object.keys(services).length + ')';
        tabs[tabTitle] = (
            <NetworkConnectionsForm
              messages={modal.instance().messages.services}
              type="services"
            />);
    }
    expect(modal.instance().tabs).toEqual(tabs);
});


test('NetworkFormModal mapStateToProps', () => {
    const state = {
        form: {value: 'FORM'},
        proxy: {value: 'PROXIES'},
        service: {value: 'SERVICES'}};
    expect(mapStateToProps(state)).toEqual({
        form: 'FORM',
        proxies: 'PROXIES',
        services: 'SERVICES'});
});


test('NetworkFormModal isWrapped', () => {
    expect(NetworkFormModal.WrappedComponent).toEqual(BaseNetworkFormModal);
});
