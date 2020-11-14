import React from 'react';

import {Col, Row} from 'reactstrap';

import Header from "./header";
import Left from "./left";
import Right from "./right";
import Footer from "./footer";
import Content from "./content";
import ModalWidget from "../shared/modal";
import {AlertNotImplemented} from '../shared/alerts';
import {ModalContext} from '../app/context';

export {Header, Left, Right, Content, Footer};


export class NotImplementedModal extends React.PureComponent {

    render () {
        return <AlertNotImplemented />;
    }
}

export default class Layout extends React.PureComponent {
    static contextType = ModalContext;

    componentDidMount () {
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
            </>
        );
    }
}
