
import PropTypes from 'prop-types';

import {shallow} from "enzyme";

import EventsLogo from '../../app/images/events.svg';
import EventLogging, {
    BaseEventLogging,
    mapStateToProps} from '../../event/logging';
import {PlaygroundSection} from '../../shared/section';
import {PlaygroundLazyLog} from '../../shared/logs';


BaseEventLogging.contextTypes = {
    formatMessage: PropTypes.func.isRequired,
};

test('EventLogging render', () => {
    const dispatch = jest.fn();
    const _events = ["EVENT1", "EVENT2"];
    const context = {formatMessage: jest.fn(() => 'TITLE')};
    const events = shallow(
        <BaseEventLogging
          dispatch={dispatch}
          events={_events}
        />, {context});
    expect(events.text()).toEqual('<PlaygroundSection />');
    const section = events.find(PlaygroundSection);
    expect(section.props().icon).toEqual(EventsLogo);
    expect(section.props().title).toEqual('TITLE');
    const log = section.find(PlaygroundLazyLog);
    expect(log.props()).toEqual(
        {"extraLines": 0,
         "lineEnding": "\n",
         "logs": ["EVENT1", "EVENT2"],
         "searchEnabled": true});
    expect(context.formatMessage.mock.calls).toEqual(
        [[{"defaultMessage": "Events",
           "id": "playground.resource.title.events"}]]);
 });


test('EventLogging mapStateToProps', () => {
    const state = {event: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({events: 'VALUE'});
});


test('EventLogging isMapped', () => {
    expect(EventLogging.WrappedComponent).toEqual(BaseEventLogging);
});
