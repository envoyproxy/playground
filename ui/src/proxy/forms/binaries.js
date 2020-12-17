
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {PlaygroundFilesForm} from '../../shared/forms';

import BinaryIcon from '../../app/images/binary.png';


// VALIDATION REQUIRED
//  - binaries
//      - number of files
//      - size of each file
//      - valid filenames


export class BaseProxyBinariesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return [
            "Add binary files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `binary/` folder."
        ];
    }

    render () {
        const {dispatch, form} = this.props;
        return (
            <PlaygroundFilesForm
              fileType="binaries"
              dispatch={dispatch}
              form={form}
              icon={BinaryIcon}
              title="Add a binary"
              prefix='binary/'
              messages={this.messages} />
        );
    }
}

export default connect()(BaseProxyBinariesForm);
