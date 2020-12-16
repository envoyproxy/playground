
import React from 'react';
import exact from 'prop-types-exact';

import {ListGroup, ListGroupItem} from 'reactstrap';

import PlaygroundScreenshot from '../app/images/playground.png';


export default class PlaygroundSiteWelcome extends React.PureComponent {
    static propTypes = exact({});

    repository = "https://github.com/envoyproxy/playground";

    render () {
        return (
            <>
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
            </>);
    }
}
