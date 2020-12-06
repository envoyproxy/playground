import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Row} from 'reactstrap';

import Header from "./header";
import Left from "./left";
import Right from "./right";
import Footer from "./footer";
import Content from "./content";
import ModalWidget from "../shared/modal";
import ToastWidget, {FailToast} from "../shared/toast";
import {
    AlertDisconnected,
    AlertNotImplemented} from '../shared/alerts';
import {PlaygroundContext} from '../app/context';

export {Header, Left, Right, Content, Footer};


export class Layout extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return  (
            <div className="container-fluid">
              <Row className="p-0">
                <Col className="p-0"><Header /></Col>
              </Row>
              <Row className="p-0">
                <Col className="p-0 App-left" xs="3">
                  <Left />
                </Col>
                <Col className="p-0" xs="6"><Content /></Col>
                <Col className="p-0 App-right" xs="3">
                  <Right />
                </Col>
              </Row>
              <Row className="p-0">
                <Col className="p-0">
                  <Footer />
                </Col>
              </Row>
            </div>);
    }
}


export class Page extends React.PureComponent {
    static contextType = PlaygroundContext;
    static contextTypes = {
        modals: PropTypes.object.isRequired,
        toast: PropTypes.object.isRequired};
    static propTypes = exact({});

    _widgets = {
        toast: {
            'socket-disconnected': {
                toast: AlertDisconnected,
                title: () => "Socket disconnected!"},
            errors: {
                    toast: FailToast,
                title: () => "Errors!"}},
        modals: {
            'not-implemented': {
                modal: AlertNotImplemented,
                title: () => "Not implemented!"}}};

    get widgets () {
        return this._widgets;
    }

    componentDidMount () {
        const {modals, toast} = this.context;
        Object.assign(modals, this.widgets.modals);
        Object.assign(toast, this.widgets.toast);
    }

    render () {
        return (
            <>
              <Layout />
              <ModalWidget />
              <ToastWidget />
            </>
        );
    }
}
