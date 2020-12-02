import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, Button, Col, Row} from 'reactstrap';

import {GithubSnippet} from './snippets';


export class AlertNotImplemented extends React.PureComponent {
    static propTypes = {
        exporter: PropTypes.func.isRequired,
    };

    render () {
        const {exporter, ...props} = this.props;
        return (
            <Alert
              {...props}
              color="warning">
              <div className="row p-2 pt-0">
                Unfortunately this feature is not yet implemented.
              </div>
              <div className="row p-2">
                Perhaps you could help.
              </div>
              <div className="row p-2">
                Contributions welcome.
              </div>
              <div className="row p-3 m-1 mb-3 bg-light">
                  <GithubSnippet />
              </div>
            </Alert>);
    }
}


export class AlertDisconnected extends React.PureComponent {
    static propTypes = {
        exporter: PropTypes.func.isRequired,
    };

    render () {
        const {exporter, ...props} = this.props;
        return (
            <Alert
              {...props}
              color="danger">
              <div className="row p-2 pt-0">
                Socket disconnected, attempting to reconnect...
              </div>
            </Alert>);
    }
}


export class AlertValidation extends React.PureComponent {
    static propTypes = {
        validation: PropTypes.object
    };

    render () {
        const {validation} = this.props;
        if (!validation) {
            return '';
        }
        return (
            <Alert color="danger">
              {Object.entries(validation).map(([k, v], i) => {
                  return (
                      <Row>
                        <Col sm={1} className="font-weight-bold">
                          &nbsp;
                        </Col>
                        <Col sm={2} className="font-weight-bold">
                          {k}
                        </Col>
                           <Col sm={9}>
                             {v}
                           </Col>
                      </Row>
                  );
              })}
            </Alert>);
    }
}


export class AlertStartFailed extends React.PureComponent {
    static propTypes = exact({
        onReconfigure: PropTypes.func.isRequired,
        icon: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        alt: PropTypes.string,
    });

    render () {
        const {alt, icon, message, onReconfigure} = this.props;
        return (
            <>
              <Alert color="danger">
                <Button
                  className="float-right"
                  onClick={onReconfigure}
                  size="sm"
                  color="info">
                  Reconfigure
                </Button>
                <img
                  alt={alt || message}
                  src={icon}
                  width="24px"
                  className="mr-2" />
                {message}
              </Alert>
            </>);
    }
}
