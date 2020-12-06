
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Row} from 'reactstrap';

import {ActionRemove} from '../../actions';


export class PlaygroundFieldListHeaders extends React.PureComponent {
    static propTypes = exact({
        headers: PropTypes.array.isRequired,
        onDelete: PropTypes.func,
    });

    render () {
        const {headers, onDelete} = this.props;
        return (
            <Row className="pl-5 pr-5">
              {onDelete &&
               <Col sm={1} className="m-0 p-0">
                 <div className="p-1 bg-dark">
                   <span>&nbsp;</span>
                 </div>
               </Col>
              }
              {headers.map(([k, v], i) => {
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
    static propTypes = exact({
        item: PropTypes.array.isRequired,
        headers: PropTypes.array.isRequired,
        name: PropTypes.string.isRequired,
        onDelete: PropTypes.func,
    });

    render () {
        const {headers, name, onDelete, item} = this.props;
        return (
            <Row className="pl-5 pr-5">
              {onDelete &&
               <Col sm={1} className="m-0 p-0">
                 <div className="p-2 bg-white border-bottom">
                   <ActionRemove
                     title={name}
                     name={name}
                     remove={evt => onDelete(name)} />
                 </div>
               </Col>
              }
              {headers.map(([k, v], i) => {
                  return (
                      <Col sm={k}
                           key={i}
                           className="m-0 p-0 border-bottom bg-white">
                        {item[i]}
                      </Col>
                  );
              })}
            </Row>);
    }
}


export class PlaygroundFieldListItems extends React.PureComponent {
    static propTypes = exact({
        keys: PropTypes.array.isRequired,
        headers: PropTypes.array.isRequired,
        row: PropTypes.func.isRequired,
        onDelete: PropTypes.func,
    });

    render () {
        const {headers, keys, onDelete, row} = this.props;
        return (
            <>
              {keys.map((item, i) => {
                  return (
                      <PlaygroundFieldListItem
                        onDelete={onDelete}
                        item={row(item)}
                        name={item}
                        headers={headers}
                        key={i}
                      />);
              })}
            </>
        );
    }
}


export class PlaygroundFieldList extends React.PureComponent {
    static propTypes = exact({
        headers: PropTypes.array.isRequired,
        keys: PropTypes.array.isRequired,
        row: PropTypes.func.isRequired,
        onDelete: PropTypes.func,
    });

    render () {
        const {headers, row, keys, onDelete} = this.props;
        if (keys.length === 0) {
            return '';
        }
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <PlaygroundFieldListHeaders
                  headers={headers}
                  onDelete={onDelete}
                />
                <PlaygroundFieldListItems
                  keys={keys}
                  headers={headers}
                  onDelete={onDelete}
                  row={row}
                />
              </Col>
            </Row>);
    }
}
