
import {Provider} from 'react-redux';

import {shallow} from "enzyme";

import {
    PlaygroundApp, PlaygroundContext,
    playground, store} from '../app';



test('PlaygroundApp render', () => {
    const app = shallow(<PlaygroundApp />);
    expect(app.text()).toBe('<Provider />');
    const provider = app.find(Provider);
    expect(provider.props().store).toEqual(store);
    const context = provider.find(PlaygroundContext.Provider);
    expect(context.props.value).toEqual(playground);
});
