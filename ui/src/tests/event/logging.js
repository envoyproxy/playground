
import {shallow} from "enzyme";

import EventsLogo from '../../app/images/events.svg';
import EventLogging, {
    BaseEventLogging,
    mapStateToProps} from '../../event/logging';
import {PlaygroundSection} from '../../shared/section';
import {PlaygroundLazyLog} from '../../shared/logs';


test('EventLogging render', () => {
    const dispatch = jest.fn();
    const _events = ["EVENT1", "EVENT2"];
    const events = shallow(
        <BaseEventLogging
          dispatch={dispatch}
          events={_events}
        />);
    expect(events.text()).toEqual('<PlaygroundSection />');
    const section = events.find(PlaygroundSection);
    expect(section.props().icon).toEqual(EventsLogo);
    expect(section.props().title).toEqual('Events');
    const log = section.find(PlaygroundLazyLog);
    expect(log.props()).toEqual(
        {"extraLines": 0,
         "lineEnding": "\n",
         "logs": ["EVENT1", "EVENT2"],
         "searchEnabled": true});
 });


test('EventLogging mapStateToProps', () => {
    const state = {event: {value: 'VALUE'}};
    expect(mapStateToProps(state)).toEqual({events: 'VALUE'});
});


test('EventLogging isMapped', () => {
    expect(EventLogging.WrappedComponent).toEqual(BaseEventLogging);
    expect(EventLogging._stateMapper).toEqual(mapStateToProps);
});
