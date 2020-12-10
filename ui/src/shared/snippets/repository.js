
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {NavLink} from 'reactstrap';

import GithubLogo from '../../app/images/github.svg';


export class BasePlaygroundRepository extends React.PureComponent {
    static propTypes = exact({
        repository: PropTypes.string.required,
    });

    render () {
        const {repository} = this.props;
        return (
            <>
              <NavLink href={repository} className="m-0 p-0">
                <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" />
                {repository}
              </NavLink>
            </>
        );
    }
}


export const mapStateToProps = function(state) {
    return {
        repository: state.meta.value.repository
    };
};

export default connect(mapStateToProps)(BasePlaygroundRepository);
