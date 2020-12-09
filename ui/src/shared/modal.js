import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import {updateUI, clearForm, updateForm} from '../app/store';
import {PlaygroundContext} from '../app/context';
import {ContainerError, ContainerStarting} from './container';
import {PlaygroundFormTabs} from './tabs';


export class PlaygroundModalFooter extends React.PureComponent {
    static propTypes = exact({
        action: PropTypes.string.isRequired,
        edit: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        editClose: PropTypes.string,
        editAction: PropTypes.string,
        actionWarning: PropTypes.string,
    });

    render () {
        const {
            action, actionWarning,
            editAction, editClose, edit,
            onClose, disabled=false, onSubmit} = this.props;
        let cancelAction = "Cancel";
        let _action = action;
        if (edit) {
            if (editClose) {
                cancelAction = editClose;
            }
            if (editAction) {
                _action = editAction;
            } else {
                _action = null;
            }
        }
        return (
            <ModalFooter className="bg-light">
              {actionWarning &&
               <Alert color="warning">
                 {actionWarning}
               </Alert>
              }
              {_action &&
               <Button
                 color="primary"
                 onClick={onSubmit}
                 disabled={disabled}>{_action}</Button>
              }
              <Button
                color="secondary"
                onClick={onClose}>{cancelAction}</Button>
            </ModalFooter>);
    }
}


export class ModalParts extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        modal: PropTypes.elementType.isRequired,
        action: PropTypes.string.isRequired,
        title: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        icon: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired,
        onSubmit: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
        errors: PropTypes.object,
        editClose: PropTypes.string,
        editAction: PropTypes.string,
        actionWarning: PropTypes.string,
    });

    close = (e) => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: null}));
        dispatch(clearForm());
    }

    getIcon = () => {
        const {icon} = this.props;
        if (typeof icon === 'function') {
            return icon();
        }
        return icon;
    }

    render () {
        const {
            actionWarning, modal: Content,
            onSubmit, onUpdate, form, editAction, editClose,
            dispatch, action, title, status, icon} = this.props;
        let disabled = false;
        const {name, errors={}, edit=false, valid, validation} = form;
        if (!valid || validation || Object.keys(errors).length > 0) {
            disabled = true;
        }
        return (
            <>
              <ModalHeader
	        toggle={this.toggle}
                className="p-2 bg-light">
                {title &&
                 <div>
                   {icon &&
                    <img
                      alt={title(name, edit)}
                      src={this.getIcon()}
                      width="28px"
                      className="ml-1 mr-2"  />
                   }
                   {title(name, edit)}
                 </div>
                }
              </ModalHeader>
              <ModalBody>
                {Content &&
                 <Content
                   form={form}
                   dispatch={dispatch}
                   onUpdate={onUpdate}
                   status={status} />
                }
              </ModalBody>
              <PlaygroundModalFooter
                action={action}
                actionWarning={actionWarning}
                edit={edit}
                editAction={editAction}
                editClose={editClose}
                disabled={disabled}
                onSubmit={onSubmit}
                onClose={this.close} />
            </>);
    }
}


export class BaseModalWidget extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        ui: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        className: PropTypes.string,
    });

    close = (e) => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: null}));
        dispatch(clearForm());
    }

    render () {
        const {modals} = this.context;
        const {className, dispatch, ui, form} = this.props;
        const {modal, tabs={}} = ui;
        const {status, validation} = form;
        let {warning} = form;
        const isOpen = Boolean(modal);
        if (!tabs[modal] || tabs[modal] === 0) {
            warning = '';
        }
        return (
            <>
              <Modal
		isOpen={isOpen}
                size="xl"
                toggle={this.close}
                autoFocus={false}
                className={className}>
                {isOpen &&
                 <ModalParts
                   actionWarning={warning}
                   errors={validation}
                   status={status || ''}
                   dispatch={dispatch}
                   form={form}
                   {...modals[modal]} />
                }
              </Modal>
            </>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        ui: state.ui.value,
    };
}

const ModalWidget = connect(mapStateToProps)(BaseModalWidget);
export default ModalWidget;


export class BasePlaygroundFormModal extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        success: PropTypes.object.isRequired,
        messages: PropTypes.array.isRequired,
        tabs: PropTypes.object.isRequired,
        icon: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        iconAlt: PropTypes.string,
        fail: PropTypes.array,
        failMessage: PropTypes.string,
    });

    closeModal = () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: null}));
        dispatch(clearForm());
    }

    updateStatus = () => {
        const {form, success} = this.props;
        const {status} = form;
        if (status === success) {
            this.timer = setTimeout(this.closeModal, 1000);
        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render () {
        const {
            dispatch, icon, iconAlt, fail=[], failMessage, form, messages,
            success, tabs, type} = this.props;
        const {name, logs, status='', validation} = form;
        let color = 'info';
        if ((status || '').length > 0) {
            if (status === success) {
                color = 'success';
                this.timer = setTimeout(this.updateStatus, 1000);
            } else if (fail.indexOf(status) !== -1) {
                return (
                    <ContainerError
                      icon={icon}
                      iconAlt={iconAlt || name}
                      name={name}
                      logs={logs}
                      message={failMessage}
                      onReconfigure={evt => dispatch(updateForm({status: null}))}
                    />);
            }
            return (
                <ContainerStarting
                  progress={(messages[status] || messages.default)[0]}
                  message={(messages[status] || messages.default)[1]}
                  color={color}
                  icon={icon}
                  iconAlt={iconAlt || name}
                />);
        }
        return (
            <PlaygroundFormTabs
              validation={validation}
              name={type}
              tabs={tabs} />
        );
    }
}


const mapPlaygroundModalStateToProps = function(state, other) {
    return {
        form: state.form.value,
    };
};

const PlaygroundFormModal = connect(mapPlaygroundModalStateToProps)(BasePlaygroundFormModal);
export {PlaygroundFormModal};
