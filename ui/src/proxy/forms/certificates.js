
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {
    PlaygroundForm, PlaygroundFormGroup} from '../../shared/forms';

import {PlaygroundFilesField} from '../../shared/forms/fields/files';

import CertificateIcon from '../../app/images/certificate.svg';
import {updateForm} from '../../app/store';
import {readFile} from '../../shared/utils';

// VALIDATION REQUIRED
//  - certs
//      - number of files
//      - length of each file
//      - valid file extensions for certs ?
//      - valid filenames


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        proxies: state.proxy.value,
        meta: state.meta.value,
    };
};


export class BaseProxyCertificatesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {certs={}} = form;
        const update = {};
        update[evt.target.files[0].name] = (await readFile(evt.target.files[0])).split(',')[1];
        dispatch(updateForm({certs: {...certs, ...update}}));
    }

    get messages () {
        return [
            "Add certificates and key files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `certs/` folder."
        ];
    }

    onDelete = async (name) => {
        const {dispatch, form} = this.props;
        const {certs: _certs={}} = form;
        const certs = {..._certs};
        delete certs[name];
        await dispatch(updateForm({certs}));
    }

    render () {
        const {form} = this.props;
        const {certs={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
              <PlaygroundFilesField
                name="certificates"
                title="Add a cert/key"
                icon={CertificateIcon}
                prefix='certs/'
                onChange={this.onChange}
                onDelete={this.onDelete}
                files={certs} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const ProxyCertificatesForm = connect(mapStateToProps)(BaseProxyCertificatesForm);
export {ProxyCertificatesForm};
