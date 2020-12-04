
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {CustomInput, Col, Row} from 'reactstrap';

import {ActionRemove} from '../../actions';


export class PlaygroundFieldListHeaders extends React.PureComponent {
    static propTypes = exact({
        headers: PropTypes.object.isRequired,
    });

    render () {
        const {headers} = this.props;
        return (
            <Row className="pl-5 pr-5">
              <Col sm={1} className="m-0 p-0">
                <div className="p-1 bg-dark">
                  <span>&nbsp;</span>
                </div>
              </Col>
              {Object.entries(headers).map(([k, v], i) => {
                  return (
                      <Col sm={k} key={i} className="m-0 p-0">
                        <div className="p-1 bg-dark">
                          <span>{v}</span>
                        </div>
                      </Col>
                  );
              })}
            </Row>);
    }
}


export class PlaygroundFieldListItem extends React.PureComponent {

    render () {
        const {name, onDelete, item} = this.props;
        return (
            <Row className="pl-5 pr-5">
              <Col sm={1} className="m-0 p-0">
                <div className="p-2 bg-white border-bottom">
                  <ActionRemove
                    title={name}
                    name={name}
                    remove={evt => onDelete(name)} />
                </div>
              </Col>
              {Object.entries(item).map(([k, v], i) => {
                  return (
                      <Col sm={k} className="m-0 p-0 border-bottom bg-white">
                        {v}
                      </Col>
                  );
              })}
            </Row>);
    }
}


export class PlaygroundFieldListItems extends React.PureComponent {

    render () {
        const {items, onDelete, row} = this.props;
        return (
            <>
              {items.map((item, i) => {
                  return (
                      <PlaygroundFieldListItem
                        onDelete={onDelete}
                        item={row(item)}
                        key={i}
                      />);
              })}
            </>
        );
    }
}


export class PlaygroundFieldList extends React.PureComponent {

    render () {
        return (<span />);
    }
}
