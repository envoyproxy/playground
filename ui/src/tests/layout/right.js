
import {shallow} from "enzyme";

import {Right} from '../../layout';

import ServiceResources from '../../service/resources';


test('Right render', () => {
    const right = shallow(<Right />);
    const services = right.find(ServiceResources);
    expect(services.props()).toEqual({});
});
