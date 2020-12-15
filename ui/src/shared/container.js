
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, Col, Progress, Row} from 'reactstrap';

import {AlertStartFailed} from '../shared/alerts';
import {PlaygroundFailLogs} from '../shared/logs';


export class PlaygroundProgressive extends React.Component {

    state = {value: 0};

    componentDidMount () {
        const {value=[0]} = this.props;
        this.setState({value: value[0]});
        this.timer = setTimeout(this.progress, 200);
    }

    progress = () => {
        const {value: propValue} = this.props;
        this.setState(state => {
            const {value} = state;
            return {value: value + ((propValue[1] - value) / 2)};
        });
        this.timer = setTimeout(this.progress, 200);
    };

    componentWillUnmount () {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    componentDidUpdate (prevProps) {
        const {value} = this.props;
        if (prevProps.value !== value) {
            this.setState({value: value[0]});
        }
    }

    render () {
        const {value} = this.state;
        const {value: nothing, ...props} = this.props;
        let color = 'info';
        if (value === 100) {
            color = 'success';
        }
        console.log('PROG', value);
        return (
            <Progress
              {...props}
              color={color}
              value={value} />
        );
    }

};

export class ContainerStarting extends React.PureComponent {
    static propTypes = exact({
        color: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        iconAlt: PropTypes.string.isRequired,
        message: PropTypes.object.isRequired,
        progress: PropTypes.array,
    });

    render () {
        const {
            color, icon, iconAlt,
            message, progress} = this.props;
        return (
            <Alert color={color}>
              <Row className="m-2">
                <Col className="lead">
                  <img
                    alt={iconAlt}
                    src={icon}
                    width="32px"
                    className="mr-2" />
                  {message}
                </Col>
              </Row>
              <Row className="m-2 pt-3 pb-3 pl-2 pr-2">
                <Col>
                  <PlaygroundProgressive
                    striped
                    value={progress} />
                </Col>
              </Row>
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
