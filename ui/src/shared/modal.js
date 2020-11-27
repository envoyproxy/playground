import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import {updateUI, clearForm} from '../app/store';
import {ModalContext} from '../app/context';


export class PlaygroundModalFooter extends React.PureComponent {
    static propTypes = exact({
        action: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        editClose: PropTypes.string,
        editAction: PropTypes.string,
    });

    render () {
        const {action, editAction, editClose, edit, onClose, disabled=false, onSubmit} = this.props;
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
            <>
              {_action &&
               <Button
                 color="primary"
                 onClick={onSubmit}
                 disabled={disabled}>{_action}</Button>
              }
              <Button
                color="secondary"
                onClick={onClose}>{cancelAction}</Button>
            </>);
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
            modal: Content, onSubmit, onUpdate, form, editAction, editClose,
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
              <ModalFooter className="bg-light">
                <PlaygroundModalFooter
                  action={action}
                  edit={edit}
                  editAction={editAction}
                  editClose={editClose}
                  disabled={disabled}
                  onSubmit={onSubmit}
                  onClose={this.close} />
              </ModalFooter>
            </>);
    }
}


export class BaseModalWidget extends React.PureComponent {
    static contextType = ModalContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        ui: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        className: PropTypes.string,
    });

    render () {
        const {className, dispatch, ui, form} = this.props;
        const {modal} = ui;
        const {status, validation} = form;
        const isOpen = Boolean(modal);
        return (
            <>
              <Modal
		isOpen={isOpen}
                size="lg"
                toggle={this.close}
                className={className}>
                {isOpen &&
                 <ModalParts
                   errors={validation}
                   status={status || ''}
                   dispatch={dispatch}
                   form={form}
                   {...this.context[modal]} />
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
