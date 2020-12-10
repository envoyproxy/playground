import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {AlertValidation} from '../alerts';
import PlaygroundTabs from './base';


export default class PlaygroundFormTabs extends React.PureComponent {
    static propTypes = exact({
        tabs: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        validation: PropTypes.object,
    });

    render () {
        const {name, tabs, validation} = this.props;
        return (
            <>
              <AlertValidation
                validation={validation} />
              <PlaygroundTabs
                name={name}
                tabs={tabs} />
            </>);
    }
}
