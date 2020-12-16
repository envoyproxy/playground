
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {
    Collapse, ListGroup, ListGroupItem} from 'reactstrap';

import DockerIcon from '../app/images/docker.svg';


export class PlaygroundSiteService extends React.Component {
    static propTypes = exact({
        name: PropTypes.string.isRequired,
        data: PropTypes.object.isRequired,
    });

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
        services: PropTypes.object.isRequired,
        dispatch: PropTypes.func,
    });

    render () {
        const {services} = this.props;
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


export default connect(mapServiceStateToProps)(BasePlaygroundSiteServices);
