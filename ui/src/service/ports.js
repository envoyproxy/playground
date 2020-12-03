
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Row, Table} from 'reactstrap';


export class ServicePorts extends React.Component {
    static propTypes = exact({
        ports: PropTypes.string.isRequired,
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
                  <Table>
                    <thead className="bg-dark">
                      <tr>
                        <th>Port</th>
                        <th>Type</th>
                        <th>Information</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {(ports + '').split(',').map((port, i) => {
                          return (
                              <tr>
                                <td>{port}</td>
                                <td>{labels['envoy.playground.port.' + port + '.type'] || 'TCP'}</td>
                                <td>{labels['envoy.playground.port.' + port + '.info']}</td>
                              </tr>);
                      })}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </>
        );
    }
}
