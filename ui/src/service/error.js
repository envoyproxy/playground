import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Col, Row} from 'reactstrap';

import {updateForm} from '../app/store';
import {AlertStartFailed} from '../shared/alerts';
import {PlaygroundFailLogs} from '../shared/logs';


export class BaseServiceError extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
    });

    render () {
        const {dispatch, form, service_types} = this.props;
        const {logs=[], name} = form;
        const {service_type} = form;
        const message = "Failed starting service (" + name  + "). See logs for errors.";
        return (
            <>
              <AlertStartFailed
                onReconfigure={evt => dispatch(updateForm({status: null}))}
                message={message}
                icon={service_types[service_type].icon}
                alt="Service logo" />
              <Row className="pt-2 bg-light ml-0 mr-0">
                <Col sm={12}>
                  <PlaygroundFailLogs logs={logs} />
                </Col>
              </Row>
            </>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}


const ServiceError = connect(mapStateToProps)(BaseServiceError);
export {ServiceError};
