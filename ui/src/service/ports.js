
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Row} from 'reactstrap';

import CloudLogo from '../app/images/cloud.svg';
import {PlaygroundFieldList} from '../shared/forms/fields/list';


export class ServicePortsFieldList extends React.PureComponent {
    static propTypes = exact({
        labels: PropTypes.object.isRequired,
        ports: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number]).isRequired,
    });

    get headers () {
        return [
            [2, (
                <div className="text-center">
                  <img
                    alt="external"
                    src={CloudLogo}
                    width="20px"
                    className="ml-1 mr-2"  />
                  Port
                </div>
            )],
            [2, (
                <span>
                  Type
                </span>
            )],
            [8, <span>Information</span>]];
    };

    row = (port) => {
        const {labels} = this.props;
        return [
            <div className="p-1 text-center">{port}</div>,
            <div className="p-1">{labels['envoy.playground.port.' + port + '.type'] || 'TCP'}</div>,
            <div className="p-1">{labels['envoy.playground.port.' + port + '.info']}</div>];
    };

    render () {
        const {ports=''} = this.props;
        return (
            <PlaygroundFieldList
              headers={this.headers}
              row={this.row}
              keys={(ports + '').split(',')}
            />);
    }
}


export class ServicePorts extends React.Component {
    static propTypes = exact({
        ports: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
        labels: PropTypes.object.isRequired,
    });

    render () {
        const {labels, ports} = this.props;
        return (
            <>
              <Row className="p-3">
                <Col sm={12} className="bg-light p-3">
                  <div>The ports listed here are exposed by this service to any networks that the service is attached to.</div>
                  <div>These are defaults, and some images may allow for ports to be changed, added or removed.</div>
                </Col>
              </Row>
              <Row className="pl-3 pr-3">
                <Col sm={12} className="bg-light p-3">
                  <ServicePortsFieldList
                    labels={labels}
		    ports={ports} />
                </Col>
              </Row>
            </>
        );
    }
}
