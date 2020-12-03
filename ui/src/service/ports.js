
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';


export class ServicePorts extends React.Component {
    static propTypes = exact({
        ports: PropTypes.string.isRequired,
    });

    render () {
        const {ports} = this.props;
        return (
            <>
              <div>The ports listed here are exposed by this service to any networks that the service is attached to.</div>
              <div>PORTS: {ports}</div>
            </>
        );
    }
}
