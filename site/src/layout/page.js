
import React from 'react';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import EnvoyLogo from '../app/images/logo.svg';
import GithubLogo from '../app/images/github.svg';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Col, Nav, Navbar, NavbarBrand, NavItem, NavLink,
    Row} from 'reactstrap';


export class PlaygroundSiteRepository extends React.PureComponent {
    static propTypes = exact({
        repository: PropTypes.string.isRequired,
    });

    render () {
        const {repository} = this.props;
        return (
            <>
              <NavLink href={repository} className="m-0 p-0">
                <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" />
                code
              </NavLink>
            </>
        );
    }
}


export class PlaygroundSiteDocs extends React.PureComponent {
    render () {
        return (
            <>
              <NavLink href="/docs" className="m-0 p-0">
                docs
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
            [1, <PlaygroundSiteRepository repository="https://github.com/envoyproxy/playground" />],
            [2, <PlaygroundSiteDocs />],
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
              <main className="App-main container-fluid">
		<Row>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        Playground
                      </header>
                    </section>
		  </Col>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        Useful links
                      </header>
                      <dl>
                        <dt><img src={EnvoyLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Envoy proxy</dt>
                        <ul>
                          <li>
                            Website
                          </li>
                          <li>
                            <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Repository
                          </li>
                          <li>
                            Docs
                          </li>
                        </ul>
                      </dl>
                      <dl>
                        <dt><img src={EnvoyInverseLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Playground</dt>
                        <dd>
                          <ul>
                            <li>
                              Install
                            </li>
                            <li>
                              <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Repository
                            </li>
                          </ul>
                        </dd>
                      </dl>
                    </section>
		  </Col>
	        </Row>
		<Row>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        <img src={GithubLogo} width="18px" className="ml-1 mr-2" alt="Github" />
                        Code
                      </header>
                    </section>
		  </Col>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        Playground services
                      </header>
                    </section>
		  </Col>
	        </Row>
              </main>
            </div>);
    }
}
