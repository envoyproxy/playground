
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import ServiceLogo from '../app/images/service.png';
import {PlaygroundLazyLog} from '../shared/logs';
import {connect} from '../app/store';


export class BaseEventLogging extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        services: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    getLogo = (service_type) => {
        const {service_types={}} = this.props;
        if (!service_type) {
            return ServiceLogo;
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
        const headerLogo = '';
        return (
	    <section className="control-pane">
              <header className="pt-1 pb-1 bg-dark border-top border-bottom">
                <img
                  alt={title}
                  src={ServiceLogo}
                  className="ml-2 mr-2"
                  width="24px" />
                {title}
              </header>
              <div className="pt-2 bg-medium">
                <PlaygroundLazyLog
                  searchEnabled
                  lineEnding={'\n'}
                  extraLines={0}
                  logs={events}/>
              </div>
            </section>);
    }
}


export const mapStateToProps = (state) => {
    return {
        events: state.event.value,
    };
};

export default connect(mapStateToProps)(BaseEventLogging);
