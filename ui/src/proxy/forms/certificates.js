
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {PlaygroundFilesForm} from '../../shared/forms';

import CertificateIcon from '../../app/images/certificate.svg';

// VALIDATION REQUIRED
//  - certs
//      - number of files
//      - length of each file
//      - valid file extensions for certs ?
//      - valid filenames



export class BaseProxyCertificatesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return [
            "Add certificates and key files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `certs/` folder."
        ];
    }

    render () {
        const {dispatch, form} = this.props;
        const {certs={}} = form;
        return (
            <PlaygroundFilesForm
              files={certs}
              fileType="certificates"
              dispatch={dispatch}
              form={form}
              icon={CertificateIcon}
              title="Add a cert/key"
              prefix='certs/'
              messages={this.messages} />
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
};

const ProxyCertificatesForm = connect(mapStateToProps)(BaseProxyCertificatesForm);
export {ProxyCertificatesForm};
