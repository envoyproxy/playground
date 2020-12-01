import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {CustomInput, Col, Row} from 'reactstrap';

import {
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '..';

import {ActionRemove} from '../../actions';


export class PlaygroundFilesFieldList extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        files: PropTypes.object.isRequired,
        prefix: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    });

    render () {
        const {onDelete, icon, files, prefix} = this.props;
        const title = '';

        if (Object.keys(files).length === 0) {
            return '';
        }
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <Row className="pl-5 pr-5">
                  <Col sm={1} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <span>&nbsp;</span>
                    </div>
                  </Col>
                  <Col sm={11} className="m-0 p-0">
                    <div className="p-1 pl-4 bg-dark">
                      Path
                    </div>
                  </Col>
                </Row>
                {Object.keys(files).map((name, index) => {
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white border-bottom">
                              <ActionRemove
                                title={title}
                                name={title}
                                remove={evt => onDelete(name)} />
                            </div>
                          </Col>
                          <Col sm={11} className="m-0 p-0 border-bottom bg-white">
                              <img
                                alt={name}
                                src={icon}
                                width="18px"
                                className="m-2 ml-1 mr-2"  />
                            {prefix}{name}
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class PlaygroundFilesField extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        files: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    });

    render () {
        const {
            files, icon, onChange, onDelete,
            name, prefix, title} = this.props;
        return (
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label={name}
                  title={title}>
                  <Col sm={8}>
                    <CustomInput
                      type="file"
                      onInput={onChange}
                      id={name}
                      name={name} />
                  </Col>
                </PlaygroundFormGroupRow>
                <PlaygroundFilesFieldList
                  onDelete={onDelete}
                  icon={icon}
                  prefix={prefix}
                  files={{...files}} />
              </PlaygroundFormGroup>);
    }
}
