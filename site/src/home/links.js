
import React from 'react';
import exact from 'prop-types-exact';

import {ListGroup, ListGroupItem} from 'reactstrap';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import EnvoyLogo from '../app/images/logo.svg';


export default class PlaygroundSiteLinks extends React.PureComponent {
    static propTypes = exact({});

    render () {
        return (
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
            </dl>);
    }
}
