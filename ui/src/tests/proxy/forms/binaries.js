
import {shallow} from "enzyme";

import {PlaygroundFilesForm} from '../../../shared/forms';
import {ProxyBinariesForm} from '../../../proxy/forms/binaries';
import BinaryIcon from '../../../app/images/binary.png';


test('ProxyBinariesForm render', () => {
    const dispatch = jest.fn();
    const _form = {KEY: 'VALUE'};
    let form = shallow(
        <ProxyBinariesForm
          dispatch={dispatch}
          form={_form} />);
    expect(form.text()).toEqual('<PlaygroundFilesForm />');
    expect(form.props().fileType).toEqual('binaries');
    expect(form.props().dispatch).toEqual(dispatch);
    expect(form.props().form).toEqual(_form);
    expect(form.props().title).toEqual('Add a binary');
    expect(form.props().prefix).toEqual('binary/');
    expect(form.props().icon).toEqual(BinaryIcon);
    expect(form.props().messages).toEqual([
        "Add binary files required by your proxy.",
        "The files will be accessible to Envoy with the uploaded `filename` in the `binary/` folder."]);
});
