
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {ActionClear} from '../../../shared/actions';
import {PlaygroundClearWidget} from '../../../shared/widgets';


test('PlaygroundClearWidget render', () => {
    const context = {api: {clear: jest.fn()}};
    PlaygroundClearWidget.contextTypes = {api:  PropTypes.object.isRequired};
    const clear = shallow(<PlaygroundClearWidget />, {context});
    expect(clear.text()).toEqual("<ActionClear />");
    const action = clear.find(ActionClear);
    expect(action.props().action).toEqual(context.api.clear);
});
