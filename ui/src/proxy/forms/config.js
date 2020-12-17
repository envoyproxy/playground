import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {updateForm} from '../../app/store';
import {PlaygroundEditor} from '../../shared/editor';
import {PlaygroundFormGroup} from '../../shared/forms';


// VALIDATION REQUIRED
//  - code:
//      - is set
//      - valid yaml
//      - not too long, and not too short
//      - ideally valid envoy config


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
        configuration: PropTypes.string,
        errors: PropTypes.object.isRequired,
        examples: PropTypes.object.isRequired,
        configWarning: PropTypes.string,
    });

    clearConfig = () => {
        const {dispatch} = this.props;
        dispatch(updateForm({configuration: ''}));
    }

    onExampleSelect = async (evt) => {
        const {configWarning, dispatch, errors: _errors, examples} = this.props;
        const {envoy} = examples;
        const errors = {..._errors};
        // todo: implement overwrite button
        // if (configuration !== code)
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
        const {configuration=code, examples, errors, onChange} = this.props;
        const {envoy={}} = examples;
        const {configuration: configErrors=[]} =  errors;
        return (
            <PlaygroundFormGroup>
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
              />
            </PlaygroundFormGroup>);
    }
}


export default connect()(BaseProxyConfigForm);
