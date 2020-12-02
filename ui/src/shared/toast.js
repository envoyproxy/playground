import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Button, Toast, ToastHeader, ToastBody} from 'reactstrap';

import {updateUI, clearForm} from '../app/store';
import {ToastContext} from '../app/context';


export class ToastParts extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        toast: PropTypes.elementType.isRequired,
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
    });

    close = (e) => {
        const {dispatch} = this.props;
        dispatch(updateUI({toast: null}));
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
            toast: Content, onSubmit, onUpdate, form, editAction, editClose,
            dispatch, action, title, status, icon} = this.props;
        let disabled = false;
        const {name, errors={}, edit=false, valid, validation} = form;
        if (!valid || validation || Object.keys(errors).length > 0) {
            disabled = true;
        }
        return (
            <>
              <ToastHeader
	        toggle={this.toggle}
                icon="danger"
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
              </ToastHeader>
              <ToastBody>
                {Content &&
                 <Content
                   form={form}
                   dispatch={dispatch}
                   onUpdate={onUpdate}
                   status={status} />
                }
              </ToastBody>
            </>);
    }
}


export class BaseToastWidget extends React.PureComponent {
    static contextType = ToastContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        ui: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        className: PropTypes.string,
    });

    render () {
        const {className, dispatch, ui, form} = this.props;
        const {toast} = ui;
        const {status, validation} = form;
        const isOpen = Boolean(toast);
        return (
            <>
              <Toast
		isOpen={isOpen}
                size="xl"
                toggle={this.close}
                className={className}>
                {isOpen &&
                 <ToastParts
                   errors={validation}
                   status={status || ''}
                   dispatch={dispatch}
                   form={form}
                   {...this.context[toast]} />
                }
              </Toast>
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

const ToastWidget = connect(mapStateToProps)(BaseToastWidget);
export default ToastWidget;
