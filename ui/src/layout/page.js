import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {withShortcut} from 'react-keybind';

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

    render () {
        return  (
            <div className="container-fluid">
              <Row className="p-0">
                <Col className="p-0 App-header bg-dark border-bottom border-dark">
                  <Header />
                </Col>
              </Row>
              <Row className="p-0">
                <Col className="p-0 App-left" xs="3">
                  <Left />
                </Col>
                <Col className="p-0 App-content pt-3 pl-1 pr-1 bg-light" xs="6">
                  <Content />
                </Col>
                <Col className="p-0 App-right" xs="3">
                  <Right />
                </Col>
              </Row>
              <Row className="p-0">
                <Col className="p-0 App-footer bg-dark text-light p-0 m-0 pr-3 border-top border-dark row small">
                  <Footer />
                </Col>
              </Row>
            </div>);
    }
}


export class BasePage extends React.PureComponent {
    static contextType = PlaygroundContext;
    static contextTypes = {
        api:  PropTypes.object.isRequired,
        modals: PropTypes.object.isRequired,
        toast: PropTypes.object.isRequired};
    static propTypes = exact({
        shortcut: PropTypes.object.isRequired,
    });

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
        const {api, modals, toast} = this.context;
        const {shortcut} = this.props;
        Object.assign(modals, this.widgets.modals);
        Object.assign(toast, this.widgets.toast);
        shortcut.registerShortcut(
            api.proxy.add,
            ['ctrl+alt+p', 'cmd+alt+p'],
            'Create proxy',
            'Create an Envoy proxy');
        shortcut.registerShortcut(
            api.service.add,
            ['ctrl+alt+s', 'cmd+alt+s'],
            'Create service',
            'Create a service');
        shortcut.registerShortcut(
            api.network.add,
            ['ctrl+alt+n', 'cmd+alt+n'],
            'Create network',
            'Create a network');
    }

    componentWillUnmount () {
        const {api} = this.context;
        const {shortcut} = this.props;
        shortcut.unregisterShortcut(api.proxy.add, ['ctrl+alt+p', 'cmd+alt+p']);
        shortcut.unregisterShortcut(api.service.add, ['ctrl+alt+s', 'cmd+alt+s']);
        shortcut.unregisterShortcut(api.network.add, ['ctrl+alt+n', 'cmd+alt+n']);
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

const Page = withShortcut(BasePage);
export {Page}
