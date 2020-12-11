
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import {PlaygroundClearWidget} from '../../../shared/widgets';


test('PlaygroundClearWidget render', () => {
    const context = {api: {clear: jest.fn()}};

    PlaygroundClearWidget.contextTypes = {api:  PropTypes.object.isRequired};

    const logs = shallow(<PlaygroundClearWidget />, {context});
});
