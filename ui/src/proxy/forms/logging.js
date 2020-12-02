import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow, PlaygroundSelectInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


export class BaseProxyLoggingForm extends React.PureComponent {
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
        const update = {default: evt.target.value};
        dispatch(updateForm({logging: {...logging, ...update}}));
    }

    render () {
        const {form} = this.props;
        const {logging={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="log_level"
                  title="Default log level">
                  <Col sm={8}>
                    <PlaygroundSelectInput
                      onChange={this.onChange}
                      value={logging.default}
                      name="mapping_type"
                      noOption="Select log level"
                      options={[
                          ['info', 'info (default)'],
                          ['debug', 'debug'],
                          ['trace', 'trace']]} />
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const mapLoggingStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
}

const ProxyLoggingForm = connect(mapLoggingStateToProps)(BaseProxyLoggingForm);
export {ProxyLoggingForm};
