
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {NavbarBrand} from 'reactstrap';

import EnvoyLogo from '../../app/images/envoy.svg';


export class BasePlaygroundLogotype extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
    });

    render () {
        const {title, version} = this.props;
        return (
            <NavbarBrand
              className="pt-0 pb-0 mt-0 mb-0"
              to="/">
              <img
                alt="Envoy"
                src={EnvoyLogo}
                width="28px"
                className="ml-1 mr-2" />
	      <span>{title} ({version})</span>
            </NavbarBrand>
        );
    }
}


export const mapStateToProps = function(state) {
    return {
        title: state.meta.value.title,
        version: state.meta.value.version
    };
};

export default connect(mapStateToProps)(BasePlaygroundLogotype);
