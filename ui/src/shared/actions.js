import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import {Badge} from 'reactstrap';

import {logEvent, updateUI} from '../app/store';


export class ActionExport extends React.PureComponent {
    static propTypes = {
        exporter: PropTypes.func.isRequired,
    };

    render () {
        const {exporter, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={exporter}
              color="info"
              href="#"
              className="ml-2 mb-0 float-right mt-1 mr-5"
              name="export">export</Badge>);
    }
}



export class ActionImport extends React.PureComponent {
    static propTypes = {
        importer: PropTypes.func.isRequired,
    };

    render () {
        const {importer, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={importer}
              color="info"
              href="#"
              className="ml-2 mb-0 float-right mt-1 mr-5"
              name="import">import</Badge>);
    }
}

export class ActionLoad extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

    load = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    render () {
        const {className, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={this.load}
              color="info"
              href="#"
              className={classnames({
                  'ml-2': true,
                  'ml-3': true,
                  'mb-1': true,
                  'float-right': true,
                  'mt-1': true,
                  'mr-0': true,
              }, className)}
              name="load">load</Badge>);
    }
}


export class ActionSave extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

    save = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    render () {
        const {className, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={this.save}
              color="info"
              href="#"
              className={classnames({
                  'ml-2': true,
                  'ml-3': true,
                  'mb-1': true,
                  'float-right': true,
                  'mt-1': true,
                  'mr-0': true,
              }, className)}
              name="save">save</Badge>);
    }
}


export class ActionCopy extends React.PureComponent {
    static propTypes = {
        copy: PropTypes.func.isRequired,
    };

    render () {
        const {copy, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={copy}
              color="info"
              href="#"
              className="ml-2 mb-0 mt-3"
              name="copy">copy</Badge>);
    }
}

export class ActionEdit extends React.PureComponent {
    static propTypes = {
        edit: PropTypes.func.isRequired,
    };

    render () {
        const {edit, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={edit}
              color="info"
              href="#"
              name="edit">edit</Badge>);
    }
}

export class ActionClear extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

    clear = async () => {
        const {dispatch} = this.props;
        await dispatch(logEvent({
            status: 'clear',
            name: 'all',
            type: 'playground'}));
        await this.context.api.get('/clear');
    };

    render () {
        const {className, color='secondary', ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={this.clear}
              color={color}
              href="#"
              className={classnames({'float-right': true, 'mb-1': true, 'mt-1': true}, className)}
              name="clear">clear</Badge>);
    }
}


export class ActionRemove extends React.Component {
    static propTypes = {
        remove: PropTypes.func.isRequired,
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    };

    state = {clicked: false};

    onClick = async (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const {remove} = this.props;
        this.setState({clicked: true});
        await remove(evt);
    }

    render () {
        const {clicked} = this.state;
        const {remove, name, ...props} = this.props;
        return (
            <Badge
              {...props}
              name={name}
              color="danger"
              href={!clicked ? "#" : null}
              onClick={!clicked ? this.onClick : null}>-</Badge>);
    }
}


export class ActionAdd extends React.PureComponent {
    static propTypes = {
        add: PropTypes.func.isRequired,
        title: PropTypes.string,
    };

    render () {
        const {add, title, ...props} = this.props;
        return (
            <Badge
              {...props}
              color="success"
              name={title}
              href="#"
              onClick={add}>+</Badge>);
    }
}
