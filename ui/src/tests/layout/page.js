
import {shallow} from "enzyme";

import {withShortcut} from 'react-keybind';

import {Col, Row} from 'reactstrap';

import {
    Content, Footer, Header, Page,
    Left, Right, Layout} from '../../layout';
import {BasePage} from '../../layout/page';
import {
    AlertDisconnected,
    AlertNotImplemented} from '../../shared/alerts';
import ModalWidget from "../../shared/modal";
import ToastWidget, {FailToast} from "../../shared/toast";



test('Page is wrapped', () => {
    const page = shallow(<Page />);
    expect(page.props().children({shortcut: {}}).type).toEqual(BasePage);
});

test('Page render', () => {
    const context = {
        api: {
            proxy: {add: 'ADDPROXY'},
            network: {add: 'ADDNETWORK'},
            service: {add: 'ADDSERVICE'}},
        modals: {MODAL1: '', MODAL2: ''},
        toast: {TOAST1: '', TOAST2: '', errors: 'NOT'}};
    const _context = {
        modals: {...context.modals},
        toast: {...context.toast}};
    const shortcut = {registerShortcut: jest.fn()};
    const page = shallow(<BasePage shortcut={shortcut} />, {context});
    expect(shortcut.registerShortcut.mock.calls).toEqual(
        [["ADDPROXY", ["ctrl+alt+p", "cmd+alt+p"], "Create proxy", "Create an Envoy proxy"],
         ["ADDSERVICE", ["ctrl+alt+s", "cmd+alt+s"], "Create service", "Create a service"],
         ["ADDNETWORK", ["ctrl+alt+n", "cmd+alt+n"], "Create network", "Create a network"]]);
    const layout = page.find(Layout);
    expect(layout.props()).toEqual({});
    const modal = page.find(ModalWidget);
    expect(modal.props()).toEqual({});
    const toast = page.find(ToastWidget);
    expect(toast.props()).toEqual({});
    expect(context.modals).toEqual({
        ..._context.modals,
        ...page.instance().widgets.modals});
    expect(context.toast).toEqual({
        ..._context.toast,
        ...page.instance().widgets.toast});
    expect(Object.keys(page.instance().widgets.modals).length).toEqual(1);
    expect(page.instance().widgets.modals['not-implemented'].modal).toEqual(AlertNotImplemented);
    expect(page.instance().widgets.modals['not-implemented'].title()).toEqual('Not implemented!');
    expect(Object.keys(page.instance().widgets.toast).length).toEqual(2);
    expect(page.instance().widgets.toast.errors.toast).toEqual(FailToast);
    expect(page.instance().widgets.toast.errors.title()).toEqual('Errors!');
    expect(page.instance().widgets.toast['socket-disconnected'].toast).toEqual(AlertDisconnected);
    expect(page.instance().widgets.toast['socket-disconnected'].title()).toEqual('Socket disconnected!');
});


test('Page unmount', () => {
    const context = {
        api: {
            proxy: {add: 'ADDPROXY'},
            network: {add: 'ADDNETWORK'},
            service: {add: 'ADDSERVICE'}},
        modals: {MODAL1: '', MODAL2: ''},
        toast: {TOAST1: '', TOAST2: '', errors: 'NOT'}};
    const _context = {
        modals: {...context.modals},
        toast: {...context.toast}};
    const shortcut = {registerShortcut: jest.fn(), unregisterShortcut: jest.fn()};
    const page = shallow(<BasePage shortcut={shortcut} />, {context});
    page.instance().componentWillUnmount();
    expect(shortcut.unregisterShortcut.mock.calls).toEqual(
        [["ADDPROXY", ["ctrl+alt+p", "cmd+alt+p"]],
         ["ADDSERVICE", ["ctrl+alt+s", "cmd+alt+s"]],
         ["ADDNETWORK", ["ctrl+alt+n", "cmd+alt+n"]]]);
});


test('Layout render', () => {
    const layout = shallow(<Layout />);
    const div = layout.find('div').first();
    expect(div.props().className).toEqual('container-fluid');
    const rows = div.find(Row);

    expect(rows.at(0).props().className).toEqual('p-0');
    let col = rows.at(0).find(Col);
    expect(col.props().className).toEqual('p-0');
    const header = col.find(Header);
    expect(header.props()).toEqual({});

    expect(rows.at(1).props().className).toEqual('p-0');
    const cols = rows.at(1).find(Col);
    expect(cols.at(0).props().className).toEqual('p-0 App-left');
    const left = cols.at(0).find(Left);
    expect(left.props()).toEqual({});
    expect(cols.at(1).props().className).toEqual('p-0 App-content pt-3 pl-1 pr-1 bg-light');
    const content = cols.at(1).find(Content);
    expect(content.props()).toEqual({});
    expect(cols.at(2).props().className).toEqual('p-0 App-right');
    const right = cols.at(2).find(Right);
    expect(right.props()).toEqual({});

    expect(rows.at(2).props().className).toEqual('p-0');
    col = rows.at(2).find(Col);
    expect(col.props().className).toEqual('p-0');
    const footer = col.find(Footer);
    expect(footer.props()).toEqual({});
});
