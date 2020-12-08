
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import EventsLogo from '../app/images/events.svg';
import {PlaygroundLazyLog} from '../shared/logs';
import {PlaygroundSection} from '../shared/section';
import {connect} from '../app/store';


export class BaseEventLogging extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        events: PropTypes.array.isRequired,
    });

    getLogo = (service_type) => {
        const {service_types={}} = this.props;
        if (!service_type) {
            return EventsLogo;
        }
        const _service_type = service_types[service_type] || {};
        const {icon} = _service_type;
        return icon;
    };

    addModalTitle = (name) => {
        return "Create a service";
    }

    render () {
        const {events} = this.props;
        const title = 'Events';
        return (
            <PlaygroundSection
              title='Events'
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
