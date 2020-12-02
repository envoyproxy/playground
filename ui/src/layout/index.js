import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

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
import {ModalContext, ToastContext} from '../app/context';

export {Header, Left, Right, Content, Footer};


export class NotImplementedModal extends React.PureComponent {
    static propTypes = exact({})

    render () {
        return <AlertNotImplemented />;
    }
}


export class SocketDisconnectedToast extends React.PureComponent {
    static propTypes = exact({})

    render () {
        return <AlertDisconnected />;
    }
}


export class BaseLayout extends React.PureComponent {
    static contextType = ModalContext;
    static propTypes = exact({
        toast: PropTypes.object.isRequired
    })

    componentDidMount () {
        const {toast} = this.props;
        toast['socket-disconnected'] = {
            toast: SocketDisconnectedToast,
            title: () => "Socket disconnected!"};
        toast['errors'] = {
            toast: FailToast,
            title: () => "Socket disconnected!"};
        this.context['not-implemented'] = {
            modal: NotImplementedModal,
            title: () => "Not implemented!"};
    }

    render () {
        return (
            <>
              <div className="App">
                <div className="container-fluid">
                  <Row className="p-0">
                    <Col className="p-0"><Header /></Col>
                  </Row>
                  <Row className="p-0">
                    <Col className="p-0" xs="3"><Left /></Col>
                    <Col className="p-0" xs="6"><Content /></Col>
                    <Col className="p-0" xs="3"><Right /></Col>
                  </Row>
                  <Row className="p-0">
                    <Col className="p-0"><Footer /></Col>
                  </Row>
                </div>
              </div>
              <ModalWidget />
              <ToastWidget />
            </>
        );
    }
}


export default class Layout extends React.PureComponent {
    static contextType = ToastContext;
    static propTypes = exact({})

    render () {
        return (
            <BaseLayout toast={this.context} />
        );
    }
}
