
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundSelectInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


export class ProxyVersionField extends React.PureComponent {
    static propTypes = exact({
        form: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch} = this.props;
        await dispatch(updateForm({version: evt.target.value}));
    }

    get options () {
        return [
            ['envoy-dev:latest', 'envoy-dev:latest (default)'],
            ['envoy:v1.16', 'envoy:v1.16'],
            ['envoy:v1.15', 'envoy:v1.15']];
    }

    render () {
        const {form, onChange} = this.props;
        const {version} = form;
        return (
            <PlaygroundSelectInput
              onChange={onChange}
              value={version}
              name="mapping_type"
              placeholder="Version (optional)"
              options={this.options} />);
    }
}
