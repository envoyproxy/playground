
import React from 'react';
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import each from 'jest-each';

import NetworkResources, {
    BaseNetworkResources,
    mapStateToProps} from '../../network/resources';
import NetworkFormModal from '../../network/modals';
import APIResources from '../../shared/resources';


BaseNetworkResources.contextTypes = {
    formatMessage: PropTypes.func.isRequired
};


test('NetworkResources render', () => {
    const dispatch = jest.fn();
    const networks = {RES1: '', RES2: ''};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseNetworkResources
          dispatch={dispatch}
          networks={networks}
        />, {context});
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('network');
    expect(api.props().logo).toEqual('cloud.svg');
    expect(api.props().title).toEqual('TITLE');
    expect(api.props().resources).toEqual(networks);
    expect(api.props().editable).toEqual(true);
    expect(api.props().addModal).toEqual({
        modal: NetworkFormModal,
        title: resources.instance().addModalTitle,
        editClose: 'TITLE',
        action: 'TITLE'});
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Networks",
           "id": "playground.resource.title.networks"}],
         [{"defaultMessage": "Close",
           "id": "playground.form.network.create.action.close"}],
         [{"defaultMessage": "Create network",
           "id": "playground.form.network.create.action.create"}]]);
});


each([undefined, false, true, 1]).test('NetworkResources addModalTitle', (edit) => {
    const dispatch = jest.fn();
    const networks = {RES1: '', RES2: ''};
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const resources = shallow(
        <BaseNetworkResources
          dispatch={dispatch}
          networks={networks}
        />, {context});
    context.formatMessage.mockClear();
    expect(resources.instance().addModalTitle('NAME', edit)).toEqual('TITLE');
    if ([true, 1].indexOf(edit) !== -1) {
        expect(context.formatMessage.mock.calls).toEqual(
            [[{"defaultMessage": "Update network ({network})",
               "id": "playground.form.network.update.action.title"},
              {"network": "NAME"}]]);
    } else {
        expect(context.formatMessage.mock.calls).toEqual(
            [[{"defaultMessage": "Create a network",
               "id": "playground.form.network.create.action.title"}]]);
    }
});


test('NetworkResources mapStateToProps', () => {
    const state = {network: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({networks: 'VALUE'});
});


test('NetworkResources isMapped', () => {
    expect(NetworkResources.WrappedComponent).toEqual(BaseNetworkResources);
});
