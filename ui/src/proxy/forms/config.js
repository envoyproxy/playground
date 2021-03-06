import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {updateForm} from '../../app/store';
import {PlaygroundEditor} from '../../shared/editor';


const code =
`static_resources:
  clusters:
    ...
  listeners:
    ...
`;


export class BaseProxyConfigForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        examples: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        configWarning: PropTypes.string,
    });

    clearConfig = () => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: ''}));
    }

    onExampleSelect = async (evt) => {
        const {configWarning, dispatch, form, examples} = this.props;
        const {errors: _errors} = form;
        const {envoy} = examples;
        const errors = {..._errors};
        if (envoy[evt.target.value]) {
            const response = await fetch(envoy[evt.target.value].path);
            const text = await response.text();
            delete errors.configuration;
            await dispatch(updateForm({configuration: text, valid: true, errors, warning: undefined}));
        } else {
            await dispatch(updateForm({configuration: code, valid: false, warning: configWarning}));
        }
    }

    render ()  {
        const {form, examples, onChange} = this.props;
        const {envoy={}} = examples;
        const {configuration=code, errors} = form;
        const {configuration: configErrors=[]} =  errors;
        return (
            <PlaygroundEditor
              title="Configuration*"
              name="configuration"
              content={configuration}
              format="yaml"
              examples={envoy}
              clearConfig={this.clearConfig}
              onChange={onChange}
              onExampleSelect={this.onExampleSelect}
              errors={configErrors}
            />);
    }
}


export const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        examples: state.example.value,
    };
};

export default connect(mapStateToProps)(BaseProxyConfigForm);
