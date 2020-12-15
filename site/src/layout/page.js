
import React from 'react';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import EnvoyLogo from '../app/images/logo.svg';
import GithubLogo from '../app/images/github.svg';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Col, ListGroup, ListGroupItem,
    Nav, Navbar, NavbarBrand, NavItem, NavLink,
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
              <main className="App-main container-fluid pt-3">
		<Row>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        <img src={EnvoyInverseLogo} width="22px" className="ml-1 mr-2" alt="Github" />
                        Playground
                      </header>
                      <div className="p-4 row">
                        <div className="reflection-box col">
                          <div className="reflection" style={{backgroundImage: `url(${EnvoyLogo})`}}/>
                        </div>
                        <div className="col pt-5">
                          <ListGroup className="bg-dark">
                            <ListGroupItem className="bg-dark" tag="span" href="#">Learn/test Envoy config</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="span" href="#">Test Envoy with upstream services</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="span" href="#">Model network/proxy architectures</ListGroupItem>
                          </ListGroup>
                        </div>
                      </div>
                    </section>
		  </Col>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        Useful links
                      </header>
                      <dl className="p-4">
                        <dt><img src={EnvoyInverseLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Playground</dt>
                        <dd className="p-2">
                          <ListGroup className="bg-dark">
                            <ListGroupItem className="bg-dark" tag="a" href="#">Install</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="a" href="#">Learn</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="a" href="#">Contribute</ListGroupItem>
                          </ListGroup>
                        </dd>
                        <dt><img src={EnvoyLogo} width="18px" className="ml-1 mr-2" alt="Github" /> Envoy proxy</dt>
                        <dd className="p-4">
                          <ListGroup className="bg-dark">
                            <ListGroupItem className="bg-dark" tag="a" href="#">Web</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="a" href="#">Code</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="a" href="#">Docs</ListGroupItem>
                          </ListGroup>
                        </dd>
                     </dl>
                    </section>
		  </Col>
	        </Row>
		<Row>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        <img src={GithubLogo} width="22px" className="ml-1 mr-2" alt="Github" />
                        Code
                      </header>
                      <div  className="p-2">
                        <dl className="p-2">
                          <dt>Repository</dt>
                          <dd>
                            https://github.com/envoyproxy/playground
                          </dd>
                          <dt>Current release</dt>
                          <dd>
                            ...release...
                          </dd>
                          <dt>Recent activity</dt>
                          <dd>
                            <ul>
                              <li>
                                PR opened...
                              </li>
                            </ul>
                          </dd>
                        </dl>
                      </div>
                    </section>
		  </Col>
		  <Col>
                    <section className="mt-3">
                      <header className="bg-dark p-2">
                        <img src={GithubLogo} width="22px" className="ml-1 mr-2" alt="Github" />
                        Playground services
                      </header>
                      <dl className="p-4">
                        <dt>Redis</dt>
                        <dd className="p-2">
                          <ListGroup className="bg-dark">
                            <ListGroupItem className="bg-dark" tag="a" href="#">redis:latest</ListGroupItem>
                            <ListGroupItem className="bg-dark" tag="a" href="#">redis.io</ListGroupItem>
                          </ListGroup>
                        </dd>
                      </dl>
                    </section>
		  </Col>
	        </Row>
              </main>
            </div>);
    }
}
