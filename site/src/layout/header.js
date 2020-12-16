
import React from 'react';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Collapse, Nav, Navbar, NavbarBrand, NavItem, NavLink,
    NavbarToggler} from 'reactstrap';

import {PlaygroundSiteContext} from "../app/context";
import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import GithubLogo from '../app/images/github.svg';


export class PlaygroundSiteLogotype extends React.PureComponent {
    static propTypes = exact({
        title: PropTypes.string.isRequired,
    });

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
    static propTypes = exact({});

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
    static contextType = PlaygroundSiteContext;
    static propTypes = exact({});

    render () {
        const {repository} = this.context;
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
    static propTypes = exact({});

    get navs () {
        return [
            <PlaygroundSiteRepository />,
            <PlaygroundSiteDocs />];
    }

    render () {
        return (
              <PlaygroundPageNav
                className="border-bottom border-dark"
                navs={this.navs} />);
    }
}
