
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Nav, Navbar, NavItem} from 'reactstrap';


export class PlaygroundPageNav extends React.PureComponent {
    static propTypes = exact({
        navs: PropTypes.array.isRequired,
        tag: PropTypes.string,
    });

    render () {
        const {navs, tag} = this.props;
        return (
            <Navbar tag={tag} bg="dark" variant="dark" className="col p-0 pl-1 mt-0 mb-0 bg-dark border-bottom border-dark">
              <Nav className="container-fluid">
                {navs.map(([width, nav], i) => {
                    const className = "col-sm-" + width + " pl-0";
                    return (
                        <NavItem className={className}>
                          {nav}
                        </NavItem>);
                })}
              </Nav>
            </Navbar>
        );
    }
}
