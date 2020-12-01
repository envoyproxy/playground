import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Col, Form, FormGroup, Label, Row } from 'reactstrap';


export class FormIntroMessage extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.array.isRequired,
    });

    render () {
        const {children} = this.props;
        return (
            <FormGroup className="mt-0 pt-0 bg-light">
              <Row>
                <Col>
                  <div className="p-3 text-dark">
                    {children}
                  </div>
                </Col>
              </Row>
            </FormGroup>);
    }
}


export class PlaygroundFormGroup extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object]).isRequired,
        check: PropTypes.bool,
    });

    render () {
        const {check=false, children} = this.props;
        return (
            <FormGroup className="mt-0 pt-0 bg-light" check={check}>
              {children}
            </FormGroup>);
    }
}


export class PlaygroundForm extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object]).isRequired,
        messages: PropTypes.array.isRequired,
        onSubmit: PropTypes.func,
    });

    onSubmit = (evt) => {
        const {onSubmit} = this.props;
        evt.preventDefault();
        if (onSubmit) {
            onSubmit(evt);
        }
    };

    render () {
        const {children, messages} = this.props;
        return (
            <Form className="mt-3" onSubmit={this.onSubmit}>
              <FormIntroMessage>
                {messages.map((message, index) => {
                    return (
                        <Row key={index}>
                          <Col>
                            {message}
                          </Col>
                        </Row>);
                })}
              </FormIntroMessage>
              {children}
            </Form>);
    }
}


export class PlaygroundFormGroupRow extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object]).isRequired,
        label: PropTypes.string,
        title: PropTypes.string,
    });

    render () {
        const {children, label, title} = this.props;
        return (
            <Row className="mb-1 mt-1 pt-1 pb-1">
              <Label sm={3} for={label}  className="text-right">
                <div>
                  {title}
                </div>
              </Label>
              {children}
            </Row>);
    }
}
