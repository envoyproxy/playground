
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundSelectInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


export class ProxyLoggingDefaultField extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        logging: PropTypes.object.isRequired,
    });

    get options () {
        return [
            ['info', 'info (default)'],
            ['debug', 'debug'],
            ['trace', 'trace']];
    }

    render () {
        const {logging, onChange} = this.props;
        return (
            <PlaygroundFormGroupRow
              label="log_level"
              title="Default log level">
              <Col sm={8}>
                <PlaygroundSelectInput
                  onChange={onChange}
                  value={logging.default}
                  name="mapping_type"
                  placeholder="Select log level"
                  options={this.options} />
              </Col>
            </PlaygroundFormGroupRow>);
    }
}


export class ProxyLoggingForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
    });

    get messages () {
        return [
            "Select a log level for your proxy.",
        ];
    }

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {logging={}} = form;
        const update = {'default': evt.target.value};
        await dispatch(updateForm({logging: {...logging, ...update}}));
    }

    render () {
        const {form} = this.props;
        const {logging={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <ProxyLoggingDefaultField
                  logging={logging}
                  onChange={this.onChange}
                />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}
