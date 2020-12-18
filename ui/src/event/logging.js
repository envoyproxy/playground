
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {IntlContext} from 'react-intl';

import {connect} from 'react-redux';

import EventsLogo from '../app/images/events.svg';
import {PlaygroundLazyLog} from '../shared/logs';
import {PlaygroundSection} from '../shared/section';


export class BaseEventLogging extends React.PureComponent {
    static contextType = IntlContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        events: PropTypes.array.isRequired,
    });

    get title () {
        const {formatMessage} = this.context;
        return formatMessage({
            id: 'playground.resource.title.events',
            defaultMessage: "Events"});
    }

    render () {
        const {events} = this.props;
        return (
            <PlaygroundSection
              title={this.title}
              name="events"
              icon={EventsLogo}>
              <PlaygroundLazyLog
                searchEnabled
                lineEnding={'\n'}
                extraLines={0}
                logs={events}/>
            </PlaygroundSection>);
    }
}


export const mapStateToProps = (state) => {
    return {
        events: state.event.value,
    };
};

export default connect(mapStateToProps)(BaseEventLogging);
