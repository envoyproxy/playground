
import {shallow} from "enzyme";

import {BaseProxyCertificatesForm} from '../../../proxy/forms/certificates';
import CertificateIcon from '../../../app/images/certificate.svg';


test('ProxyCertificatesForm render', () => {
    const dispatch = jest.fn();
    const _form = {KEY: 'VALUE'};
    let form = shallow(
        <BaseProxyCertificatesForm
          dispatch={dispatch}
          form={_form} />);
    expect(form.text()).toEqual('<PlaygroundFilesForm />');
    expect(form.props().fileType).toEqual('certs');
    expect(form.props().dispatch).toEqual(dispatch);
    expect(form.props().form).toEqual(_form);
    expect(form.props().title).toEqual('Add a cert/key');
    expect(form.props().prefix).toEqual('certs/');
    expect(form.props().icon).toEqual(CertificateIcon);
    expect(form.props().warnings).toEqual([
        "The certificate files will be stored ephemerally in the Envoy Docker container.",
        "If your certificates are for production or need to be kept safe, you might instead want to use some self-signed certificates for testing."]);
    expect(form.props().messages).toEqual([
        "Add certificates and key files required by your proxy.",
        "The files will be accessible to Envoy with the uploaded `filename` in the `certs/` folder."]);
});
