import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import {Badge} from 'reactstrap';


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
              className="ml-2 mb-0 float-right mt-1 mr-5"
              name="import">import</Badge>);
    }
}

export class ActionLoad extends React.PureComponent {
    static propTypes = {
        load: PropTypes.func.isRequired,
    };

    render () {
        const {load, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={load}
              color="info"
              className="ml-2 mb-0 float-right mt-1 mr-5"
              name="load">load</Badge>);
    }
}



export class ActionSave extends React.PureComponent {
    static propTypes = {
        save: PropTypes.func.isRequired,
    };

    render () {
        const {save, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={save}
              color="info"
              className="ml-2 mb-0 float-right mt-1 mr-5"
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
              name="edit">edit</Badge>);
    }
}

export class ActionClear extends React.PureComponent {
    static propTypes = {
        clear: PropTypes.func.isRequired,
    };

    render () {
        const {clear, className, ...props} = this.props;
        return (
            <Badge
              {...props}
              onClick={clear}
              color="info"
              className={classnames({'ml-2': true}, className)}
              name="clear">clear</Badge>);
    }
}


export class ActionRemove extends React.PureComponent {
    static propTypes = {
        remove: PropTypes.func.isRequired,
        name: PropTypes.string.isRequired,
    };

    render () {
        const {remove, name, ...props} = this.props;
        return (
            <Badge
              {...props}
              name={name}
              color="danger"
              onClick={remove}>-</Badge>);
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
              onClick={add}>+</Badge>);
    }
}
