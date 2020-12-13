
import React from 'react';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import GithubLogo from '../app/images/github.svg';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Nav, Navbar, NavbarBrand, NavItem, NavLink} from 'reactstrap';


export class PlaygroundSiteRepository extends React.PureComponent {
    static propTypes = exact({
        repository: PropTypes.string.isRequired,
        dispatch: PropTypes.func,
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


export class PlaygroundPageNav extends React.PureComponent {
    static propTypes = exact({
        navs: PropTypes.array.isRequired,
        tag: PropTypes.string,
        className: PropTypes.string,
    });

    render () {
        const {className='', navs, tag} = this.props;
        return (
            <Navbar
              tag={tag}
              className={"col p-0 pl-1 mt-0 mb-0 bg-dark " + className}>
              <Nav className="container-fluid">
                {navs.map(([width, nav], i) => {
                    const className = "col-sm-" + width + " pl-0";
                    return (
                        <NavItem
                          key={i}
                          className={className}>
                          {nav}
                        </NavItem>);
                })}
              </Nav>
            </Navbar>
        );
    }
}


export default class PlaygroundPage extends React.PureComponent {

    get navs () {
        return [
            [3, <PlaygroundSiteLogotype title="Envoy proxy Playground" />],
            [3, <PlaygroundSiteRepository repository="https://github.com/envoyproxy/playground" />],
            [6, '']];
    }

    render () {
        return (
            <div className="App">
              <header className="App-header">
                <PlaygroundPageNav
                  tag="header"
                  className="border-bottom border-dark"
                  navs={this.navs} />
              </header>
              <main className="App-main">
                <img src={EnvoyInverseLogo} className="App-logo" alt="logo" />
              </main>
            </div>);
    }
}
