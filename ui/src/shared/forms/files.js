import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {PlaygroundForm} from '.';
import {PlaygroundFilesField} from './fields/files';

import {updateForm} from '../../app/store';
import {readFile} from '../../shared/utils';


export class PlaygroundFilesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        fileType: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        messages: PropTypes.array
    });

    onChange = async (evt) => {
        const {dispatch, fileType, form} = this.props;
        const files = form[fileType] || {};
        const _files = {};
        _files[evt.target.files[0].name] = (await readFile(evt.target.files[0])).split(',')[1];
        const update = {};
        update[fileType] = {...files, ..._files};
        await dispatch(updateForm(update));
    }

    onDelete = async (name) => {
        const {dispatch, fileType, form} = this.props;
        const files = form[fileType] || {};
        const _files = {...files};
        delete _files[name];
        const update = {};
        update[fileType] = _files;
        await dispatch(updateForm(update));
    }

    render () {
        const {
            icon, form, fileType,
            messages, prefix, title} = this.props;
        const files = form[fileType] || {};
        return (
            <PlaygroundForm messages={messages}>
              <PlaygroundFilesField
                name={fileType}
                title={title}
                icon={icon}
                prefix={prefix}
                onChange={this.onChange}
                onDelete={this.onDelete}
                files={files} />
            </PlaygroundForm>
        );
    }
}
