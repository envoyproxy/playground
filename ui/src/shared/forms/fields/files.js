import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {CustomInput, Col, Row} from 'reactstrap';

import {
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '..';
import {PlaygroundFieldListHeaders, PlaygroundFieldListItems} from './list';


export class PlaygroundFilesFieldList extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        files: PropTypes.object.isRequired,
        prefix: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    });

    render () {
        const {onDelete, icon, files, prefix} = this.props;

        if (Object.keys(files).length === 0) {
            return '';
        }
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <PlaygroundFieldListHeaders
                  headers={{
                      11: 'Path'}}
                />
                <PlaygroundFieldListItems
                  items={Object.keys(files)}
                  onDelete={onDelete}
                  row={(name) => {
                          return {
                              11: (
                                  <>
                                    <img
                                      alt={name}
                                      src={icon}
                                      width="18px"
                                      className="m-2 ml-1 mr-2"  />
                                    {prefix}{name}
                                  </>)}}}
                />
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
