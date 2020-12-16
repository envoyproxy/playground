
import React from 'react';

import {connect} from 'react-redux';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import EnvoyLogo from '../app/images/logo.svg';
import DockerIcon from '../app/images/docker.svg';
import GithubLogo from '../app/images/github.svg';
import LinkIcon from '../app/images/link.svg';
import ServiceIcon from '../app/images/service.png';
import PlaygroundScreenshot from '../app/images/playground.png';

import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Button, Col, Collapse, ListGroup, ListGroupItem,
    Row} from 'reactstrap';

import {PlaygroundSiteContext} from "../app/context";


export class PlaygroundSiteRepoEvent extends React.PureComponent {
    static contextType = PlaygroundSiteContext;

    render () {
        const {ago} =  this.context;
        const {event} = this.props;
        const {actor, created_at, payload, type} = event;
        const {avatar_url, login} = actor;
        const {action, number} = payload;

        // const parsed = parseGithubEvent(event);
        let verb = action;
        let object = '';

        if (type === "PushEvent") {
            verb = 'pushed';
        }

        if (type === "PullRequestEvent") {
            object = `PR #${number}`;
        }

        if (type === "IssueCommentEvent" && action === 'created') {
            const {comment} = payload;
            const {url} = comment;
            verb = <a href={url}>commented</a>;
        }

        return  (
            <ul>
              <li>
                <img src={avatar_url} width="22px" className="ml-1 mr-2" alt="Playground" />
                {login} {verb} {object}
                {' '}{ago.format(new Date(created_at))}
              </li>
            </ul>
        );
    }
}


export class PlaygroundSiteService extends React.Component {

    state = {open: false};

    onClick = () => {
        const {open} = this.state;
        this.setState({open: !open});
    }

    render () {
        const {open} = this.state;
        const {name, data} = this.props;
        const  {image, labels} = data;
        const logo = `/services/${name}/${labels['envoy.playground.logo']}`;
        return  (
            <>
              <dt className="bg-dark p-2" onClick={this.onClick}>
                <img src={logo} width="22px" className="ml-1 mr-2" alt={name} />
                {labels['envoy.playground.service']}
              </dt>
              <Collapse className="p-2" tag='dd' isOpen={open}>
                {labels['envoy.playground.description']}
                <ListGroup className="bg-dark">
                  <ListGroupItem className="bg-dark" tag="a" href="#">
                    <img src={DockerIcon} width="22px" className="ml-1 mr-2" alt="Playground" />
                    {image}
                  </ListGroupItem>
                </ListGroup>
              </Collapse>
            </>
        );
    }
}


export class BasePlaygroundSiteServices extends React.Component {
    static propTypes = exact({
        services: PropTypes.object.isRequired
    });

    render () {
        const {services} = this.props;
        console.log(services);
        return  (
            <dl className="p-2 pt-4">
              {Object.entries(services).map(([k, v], i) => {
                  return (
                      <PlaygroundSiteService key={i} name={k} data={v}  />);
              })}
            </dl>
        );
    }
}


export const mapServiceStateToProps = function(state) {
    return {
        services: state.service.value,
    };
};


const PlaygroundSiteServices = connect(mapServiceStateToProps)(BasePlaygroundSiteServices);


export class BasePlaygroundSiteRepoInfo extends React.Component {
    static propTypes = exact({
        repository: PropTypes.string.isRequired,
        repo: PropTypes.object.isRequired
    });

    state = {showAll: false}

    showMore = () => {
        this.setState({showAll: true});
    }

    render () {
        const {showAll} = this.state;
        const {repository, repo} = this.props;
        const{issues, events} = repo;
        const _events = [...events];
        if (!showAll) {
            _events.length = 5;
        }
        return (
            <div  className="p-2 pt-4">
              <dl className="p-2">
                <dt>Repository</dt>
                <dd>
                  {repository}
                </dd>
                <dd>
                  issues: {issues}
                </dd>
                <dt>Recent activity</dt>
                <dd>
                  {_events.map((event, i) => {
                      return (
                          <PlaygroundSiteRepoEvent
                            event={event} />);
                  })}
                  {!showAll &&
                   <Button onClick={this.showMore}>Show more...</Button>
                  }
                </dd>
              </dl>
            </div>
        );
    }
}


export const mapStateToProps = function(state) {
    return {
        repo: state.repo.value,
    };
};

const PlaygroundSiteRepoInfo = connect(mapStateToProps)(BasePlaygroundSiteRepoInfo);


export class PlaygroundSiteHome extends React.PureComponent {

    repository = "https://github.com/envoyproxy/playground";

    render () {
        return (
            <Col>
	      <Row>
		<Col>
                  <section className="mt-3">
                    <header className="bg-dark p-2">
                      <img src={EnvoyInverseLogo} width="22px" className="ml-1 mr-2" alt="Playground" />
                      Playground
                    </header>
                    <div className="p-2 pt-4 row">
                      <div className="reflection-box">
                        <div className="no-reflection" style={{backgroundImage: `url(${PlaygroundScreenshot})`}}/>
                      </div>
                    </div>
                    <div className="p-2 pt-0 row">
                      <div className="col pt-5">
                        <ListGroup className="bg-dark text-center" horizontal>
                          <ListGroupItem className="bg-dark" tag="span" href="#">Learn/test Envoy configuration</ListGroupItem>
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
                      <img src={LinkIcon} width="22px" className="ml-1 mr-2 rotate-90" alt="Links" />
                      Useful links
                    </header>
                    <dl className="p-2 pt-4">
                      <dt><img src={EnvoyInverseLogo} width="18px" className="ml-1 mr-2" alt="Playground" /> Playground</dt>
                      <dd className="p-2">
                        <ListGroup className="bg-dark">
                          <ListGroupItem className="bg-dark" tag="a" href="#">Install</ListGroupItem>
                          <ListGroupItem className="bg-dark" tag="a" href="#">Learn</ListGroupItem>
                          <ListGroupItem className="bg-dark" tag="a" href="#">Contribute</ListGroupItem>
                        </ListGroup>
                      </dd>
                      <dt><img src={EnvoyLogo} width="18px" className="ml-1 mr-2" alt="Envoy" /> Envoy proxy</dt>
                      <dd className="p-2">
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
                    <PlaygroundSiteRepoInfo
                      repository={this.repository} />
                  </section>
		</Col>

		<Col>
                  <section className="mt-3">
                    <header className="bg-dark p-2">
                      <img src={ServiceIcon} width="22px" className="ml-1 mr-2" alt="Playground" />
                      Playground services
                    </header>
                    <PlaygroundSiteServices
                      repository="https://github.com/envoyproxy/playground" />
                  </section>
		</Col>
	      </Row>
            </Col>);
    }
}
