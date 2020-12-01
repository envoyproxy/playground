import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {CustomInput, Col, Row} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../shared/forms';
import {PlaygroundFilesField} from '../../shared/forms/fields/files';

import BinaryIcon from '../../app/images/binary.png';
import {updateForm} from '../../app/store';
import {readFile} from '../../shared/utils';
import {ActionRemove} from '../../shared/actions';


// VALIDATION REQUIRED
//  - binaries
//      - number of files
//      - size of each file
//      - valid filenames


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        proxies: state.proxy.value,
        meta: state.meta.value,
    };
}


export class BaseProxyBinariesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {binaries={}} = form;
        const update = {};
        update[evt.target.files[0].name] = (await readFile(evt.target.files[0])).split(',')[1];
        await dispatch(updateForm({binaries: {...binaries, ...update}}));
    }

    onDelete = async (name) => {
        const {dispatch, form} = this.props;
        const {binaries: _binaries={}} = form;
        const binaries = {..._binaries};
        delete binaries[name];
        await dispatch(updateForm({binaries}));
    }

    get messages () {
        return [
            "Add binary files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `binary/` folder."
        ];
    }

    render () {
        const {form} = this.props;
        const {binaries={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFilesField
                name="binaries"
                title="Add a binary"
                icon={BinaryIcon}
                prefix='binary/'
                onChange={this.onChange}
                onDelete={this.onDelete}
                files={binaries} />
            </PlaygroundForm>
        );
    }
}

const ProxyBinariesForm = connect(mapStateToProps)(BaseProxyBinariesForm);
export {ProxyBinariesForm};
