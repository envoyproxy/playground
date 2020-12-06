
import {shallow} from "enzyme";

import {Left} from '../../layout';

import NetworkResources from '../../network/resources';
import ProxyResources from '../../proxy/resources';


test('Left render', () => {
    const left = shallow(<Left />);
    const proxies = left.find(ProxyResources);
    expect(proxies.props()).toEqual({});
    const networks = left.find(NetworkResources);
    expect(networks.props()).toEqual({});
});
