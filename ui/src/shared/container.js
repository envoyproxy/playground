
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, Col, Row} from 'reactstrap';

import {AlertStartFailed} from '../shared/alerts';
import {PlaygroundFailLogs} from '../shared/logs';


export class ContainerStarting extends React.PureComponent {
    static propTypes = exact({
        color: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        iconAlt: PropTypes.string.isRequired,
        message: PropTypes.object.isRequired,
    });

    render () {
        const {color, icon, iconAlt, message} = this.props;
        return (
            <Alert color={color}>
              <img
                alt={iconAlt}
                src={icon}
                width="24px"
                className="mr-2" />
              {message}
            </Alert>
        );
    }
}


export class ContainerError extends React.PureComponent {
    static propTypes = exact({
        onReconfigure: PropTypes.func.isRequired,
        icon: PropTypes.string.isRequired,
        iconAlt: PropTypes.string.isRequired,
        logs: PropTypes.array.isRequired,
        message: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    });

    render () {
        const {icon, iconAlt, logs, message, onReconfigure} = this.props;
        return (
            <>
              <AlertStartFailed
                onReconfigure={onReconfigure}
                message={message}
                icon={icon}
                alt={iconAlt} />
              <Row className="pt-2 bg-light ml-0 mr-0">
                <Col sm={12}>
                  <PlaygroundFailLogs logs={logs} />
                </Col>
              </Row>
            </>
        );
    }
}
