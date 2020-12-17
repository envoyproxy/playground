
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {Col} from 'reactstrap';

import {updateForm} from '../../../app/store';
import NetworkForm, {
    BaseNetworkForm} from '../../../network/forms/network';
import {PlaygroundForm, PlaygroundNameInput} from '../../../shared/forms';


BaseNetworkForm.contextTypes = {
    validators: PropTypes.object.isRequired};


test('NetworkForm render', () => {
    const dispatch = jest.fn(async () => {});
    const _form = {KEY: 'VALUE'};
    const context  = {validators: {name: jest.fn()}};
    let form = shallow(
        <BaseNetworkForm
          networks={{NET1: 'network 1'}}
          dispatch={dispatch}
          form={_form} />,
        {context});
    expect(form.text()).toEqual('<PlaygroundForm />');
});
