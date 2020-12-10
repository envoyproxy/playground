
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundSelectInput} from '../../shared/forms';

import {updateForm} from '../../app/store';


export class ProxyVersionField extends React.PureComponent {
    static propTypes = exact({
        form: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch} = this.props;
        await dispatch(updateForm({version: evt.target.value}));
    }

    get options () {
        return [
            ['envoy-dev:latest', 'envoy-dev:latest (default)'],
            ['envoy:v1.16-latest', 'envoy:v1.16-latest'],
            ['envoy:v1.15-latest', 'envoy:v1.15-latest'],
            ['envoy:v1.14-latest', 'envoy:v1.14-latest']];
    }

    render () {
        const {form} = this.props;
        const {version} = form;
        return (
            <PlaygroundSelectInput
              onChange={this.onChange}
              value={version}
              name="mapping_type"
              placeholder="Version (optional)"
              options={this.options} />);
    }
}
