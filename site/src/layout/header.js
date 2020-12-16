
import React from 'react';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import GithubLogo from '../app/images/github.svg';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Collapse, Nav, Navbar, NavbarBrand, NavItem, NavLink,
    NavbarToggler} from 'reactstrap';


export class PlaygroundSiteLogotype extends React.PureComponent {

    render () {
        const {title} = this.props;
        return (
            <NavbarBrand
              className="pt-0 pb-0 mt-0 mb-0"
              to="/">
              <img
                alt="Envoy"
                src={EnvoyInverseLogo}
                width="28px"
                className="ml-1 mr-2" />
              <span>{title}</span>
            </NavbarBrand>
        );
    }
}


export class PlaygroundSiteDocs extends React.PureComponent {
    render () {
        return (
            <>
              <NavLink href="/docs">
                docs
              </NavLink>
            </>
        );
    }
}


export class PlaygroundPageNav extends React.Component {
    static propTypes = exact({
        navs: PropTypes.array.isRequired,
        tag: PropTypes.string,
        className: PropTypes.string,
    });

    state = {open: false};

    toggle = () => {
        const {open} = this.state;
        this.setState({open: !open});
    }

    render () {
        const {open} = this.state;
        const {className='', navs, tag} = this.props;
        return (
            <Navbar
              expand="md"
              color="dark"
              dark
              tag={tag}
              className={"col bg-dark " + className}>
              <PlaygroundSiteLogotype title="Envoy proxy Playground" />
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={open} navbar>
                <Nav className="mr-auto" navbar>
                  {navs.map((nav, i) => {
                      return (
                          <NavItem
                            key={i}>
                            {nav}
                          </NavItem>);
                  })}
                </Nav>
              </Collapse>
            </Navbar>
        );
    }
}


export class PlaygroundSiteRepository extends React.PureComponent {
    static propTypes = exact({
        repository: PropTypes.string.isRequired,
    });

    render () {
        const {repository} = this.props;
        return (
            <>
              <NavLink href={repository}>
                <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" />
                code
              </NavLink>
            </>
        );
    }
}


export default class PlaygroundSiteHeader extends React.PureComponent {

    repository = "https://github.com/envoyproxy/playground";

    get navs () {
        return [
            <PlaygroundSiteRepository repository={this.repository} />,
            <PlaygroundSiteDocs />];
    }

    render () {
        return (
              <PlaygroundPageNav
                className="border-bottom border-dark"
                navs={this.navs} />);
    }
}
