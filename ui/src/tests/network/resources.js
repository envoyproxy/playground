
import React from 'react';

import {shallow} from "enzyme";

import NetworkResources, {
    BaseNetworkResources,
    mapStateToProps} from '../../network/resources';
import NetworkFormModal from '../../network/modals';
import APIResources from '../../shared/resources';


test('NetworkResources render', () => {
    const dispatch = jest.fn();
    const networks = {RES1: '', RES2: ''};
    const resources = shallow(
        <BaseNetworkResources
          dispatch={dispatch}
          networks={networks}
        />);
    expect(resources.text()).toEqual('');
    const api = resources.find(APIResources);
    expect(api.props().api).toEqual('network');
    expect(api.props().logo).toEqual('cloud.svg');
    expect(api.props().title).toEqual('Networks');
    expect(api.props().resources).toEqual(networks);
    expect(api.props().editable).toEqual(true);
    expect(api.props().addModal).toEqual({
        modal: NetworkFormModal,
        title: resources.instance().addModalTitle,
        editClose: "Close",
        action: 'Create network'});
});


test('NetworkResources addModalTitle', () => {
    const dispatch = jest.fn();
    const networks = {RES1: '', RES2: ''};
    const resources = shallow(
        <BaseNetworkResources
          dispatch={dispatch}
          networks={networks}
        />);
    expect(resources.instance().addModalTitle('NAME')).toEqual('Create a network');
    expect(resources.instance().addModalTitle('NAME', false)).toEqual('Create a network');
    expect(resources.instance().addModalTitle('NAME', true)).toEqual('Update network (NAME)');
    expect(resources.instance().addModalTitle('FOO', 1)).toEqual('Update network (FOO)');
});


test('NetworkResources mapStateToProps', () => {
    const state = {network: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({networks: 'VALUE'});
});


test('NetworkResources isMapped', () => {
    expect(NetworkResources.WrappedComponent).toEqual(BaseNetworkResources);
});
