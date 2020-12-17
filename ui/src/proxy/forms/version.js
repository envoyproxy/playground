
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundContext} from '../../app';
import {PlaygroundSelectInput} from '../../shared/forms';


export class ProxyVersionField extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        version: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    });

    render () {
        const {onChange, version} = this.props;
        const {versions} = this.context;
        return (
            <PlaygroundSelectInput
              onChange={onChange}
              value={version}
              name="mapping_type"
              placeholder="Version (optional)"
              options={versions} />);
    }
}
