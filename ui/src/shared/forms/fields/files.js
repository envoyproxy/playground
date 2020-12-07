import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, CustomInput} from 'reactstrap';

import {
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '..';
import {PlaygroundFieldList} from './list';


export class PlaygroundFilesFieldList extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        files: PropTypes.array.isRequired,
        prefix: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    });

    get headers () {
        return [[11, 'Path']];
    }

    row = (name) => {
        const {icon, prefix} = this.props;
        return [
            <>
              <img
                alt={name}
                src={icon}
                width="18px"
                className="m-2 ml-1 mr-2"  />
              {prefix}{name}
            </>];
    };

    render () {
        const {onDelete, files} = this.props;
        return (
            <PlaygroundFieldList
              headers={this.headers}
              onDelete={onDelete}
              row={this.row}
              keys={files}
            />);
    }
}


export class PlaygroundFilesFieldChooser extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    });

    render () {
        const {onChange, name, title} = this.props;
        return (
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
        );
    }
}


export class PlaygroundFilesField extends React.PureComponent {
    static propTypes = exact({
        onChange: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        files: PropTypes.array.isRequired,
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
                <PlaygroundFilesFieldChooser
                  name={name}
                  onChange={onChange}
                  title={title}
                />
                <PlaygroundFilesFieldList
                  onDelete={onDelete}
                  icon={icon}
                  prefix={prefix}
                  files={[...files]} />
              </PlaygroundFormGroup>);
    }
}
