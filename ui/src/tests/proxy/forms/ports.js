
import {shallow} from "enzyme";

import EdgeLogo from '../../../app/images/edge.svg';
import EnvoyLogo from '../../../app/images/envoy.svg';
import {
    ProxyPortsFieldList} from '../../../proxy/forms/ports';


test('ProxyPortsFieldList render', () => {
    const onDelete = jest.fn();
    const port_mappings = [
        {mapping_from: 'HOST1', mapping_to: 'INTERNAL1'},
        {mapping_from: 'HOST2', mapping_to: 'INTERNAL2', mapping_type: 'foo'}];
    const list = shallow(
        <ProxyPortsFieldList
          onDelete={onDelete}
          port_mappings={port_mappings}
        />);
    expect(list.text()).toEqual(
        "<PlaygroundFieldList />");
    expect(list.props().headers).toEqual([
        [4, (
            <span>
              <img
                alt="external"
                src={EdgeLogo}
                width="24px"
                className="ml-1 mr-2"  />
              External port
            </span>
        )],
        [3, (
            <span>
              <img
                alt="envoy"
                src={EnvoyLogo}
                width="24px"
                className="ml-1 mr-2"  />
              Internal port
            </span>
        )],
        [4, <span>Endpoint type</span>]]);

    expect(list.props().row).toEqual(list.instance().row);
    expect(list.props().keys).toEqual(port_mappings.map(m => m.mapping_from));

    const row1 = list.instance().row('HOST1');
    expect(row1.length).toEqual(3);
    expect(row1[0].props.children).toEqual('HOST1');
    expect(row1[1].props.children).toEqual('INTERNAL1');
    expect(row1[2].props.children).toEqual('Generic TCP');

    const row2 = list.instance().row('HOST2');
    expect(row2.length).toEqual(3);
    expect(row2[0].props.children).toEqual('HOST2');
    expect(row2[1].props.children).toEqual('INTERNAL2');
    expect(row2[2].props.children).toEqual('FOO');
});
