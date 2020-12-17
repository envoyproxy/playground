import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {CustomInput} from 'reactstrap';

import {updateForm} from '../../app/store';
import {
    PlaygroundForm, PlaygroundNameInput} from '../../shared/forms';
import ProxyConfigForm from './config';

import Yaml from 'js-yaml';

import {ProxyVersionField} from './version';


export class BaseProxyForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
    });

    get configWarning () {
        return "Don't forget to add Envoy configuration";
    }

    get messages () {
        return [
            "Enter a unique proxy name, and add configuration below.",
            "The proxy will be addressable on any networks it connects to with the proxy name."
        ];
    }

    get groups () {
        const {form, meta, proxies} = this.props;
        const {name='', errors={}, version} = form;
        const {min_name_length} = meta;
        let showConfig = true;
        if (name.length < min_name_length) {
            showConfig = false;
        }
        const groups = [
            [{title: 'Name*',
              label: 'name',
              cols: [
                  [4,
                   <PlaygroundNameInput
                     placeholder="Enter proxy name"
                     errors={errors}
                     value={name}
                     meta={meta}
                     taken={Object.keys(proxies)}
                     onChange={this.onNameChange} />],
                  [3,
                   <ProxyVersionField
                     onChange={this.onVersionChange}
                     version={version} />],
                  [1,
                   <span>&nbsp;</span>]]},
             {title: '',
              label: '',
              cols: [
                  [5,
                   <CustomInput
                     type="checkbox"
                     id="exampleCustomCheckbox"
                     label="Pull newest container image." />],
                  [3,
                   <span>&nbsp;</span>]]}]];
        if (showConfig) {
            groups[0].push({
                title: '',
                label: '',
                cols: [
                    [12,
                     <ProxyConfigForm
                       configWarning={this.configWarning}
                       onChange={this.onConfigChange}
                     />],
                ],
            });
        }
        return groups;
    }

    validateConfiguration = (config, errors) => {
        errors = errors || {};
        errors.configuration = [];
        let valid = true;
        if (config.length < parseInt(20)) {
            valid = false;
        }
        if (config.length > 0) {
            try {
                Yaml.safeLoad(config);
            }
            catch (error) {
                valid = false;
                errors.configuration.push(error.message);
            }
        }
        if (valid) {
            delete errors.configuration;
        }
        return valid;
    };

    onVersionChange = async (evt) => {
        const {dispatch} = this.props;
        await dispatch(updateForm({version: evt.target.value}));
    }

    onNameChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {name, errors} = evt;
        let {valid} = evt;
        const {configuration=''} = form;
        let warning;
        if (!this.validateConfiguration(configuration)) {
            valid = false;
            warning = this.configWarning;
        }
        await dispatch(updateForm({errors, valid, name, warning}));
    }

    onConfigChange = async (configuration) => {
        // TODO: validate yaml config as yaml, and length.
        const {form,  dispatch} = this.props;
        const {errors: _errors={}} = form;
        let {valid} = form;
        const errors = {..._errors};
        let warning;
        if (!this.validateConfiguration(configuration, errors)) {
            valid = false;
            warning = this.configWarning;
        } else if (!errors.name) {
            valid = true;
        }
        await dispatch(
            updateForm({
                errors,
                valid,
                configuration,
                warning}));
    }

    render () {
        return (
            <PlaygroundForm
              groups={this.groups}
              messages={this.messages} />
        );
    }
}


export const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        proxies: state.proxy.value,
        meta: state.meta.value,
    };
};

export default connect(mapStateToProps)(BaseProxyForm);
