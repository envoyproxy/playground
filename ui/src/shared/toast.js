import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Toast, ToastHeader, ToastBody} from 'reactstrap';

import {updateUI} from '../app/store';
import {PlaygroundContext} from '../app/context';

import {AlertErrors} from './alerts';


export class ToastParts extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        toast: PropTypes.elementType.isRequired,
        title: PropTypes.func.isRequired,
        icon: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired,
    });

    close = (e) => {
        const {dispatch} = this.props;
        dispatch(updateUI({toast: null}));
    }

    render () {
        const {
            toast: Content, name, canClose=true,
            title, icon='danger'} = this.props;
        let close = this.close;
        if (!canClose) {
            close = null;
        }
        return (
            <>
              <ToastHeader
                toggle={close}
                icon={icon}
                className="p-2 bg-light">
                {title &&
                 <div>
                   {title(name)}
                 </div>
                }
              </ToastHeader>
              <ToastBody>
                {Content &&
                 <Content />
                }
              </ToastBody>
            </>);
    }
}


export class BaseToastWidget extends React.PureComponent {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        ui: PropTypes.object.isRequired,
        className: PropTypes.string,
    });

    render () {
        const {toast: toasts} = this.context;
        const {className, dispatch, ui} = this.props;
        const {toast} = ui;
        const isOpen = Boolean(toast);
        return (
            <>
              <Toast
                isOpen={isOpen}
                className={className}>
                {isOpen &&
                 <ToastParts
                   dispatch={dispatch}
                   {...toasts[toast]} />
                }
              </Toast>
            </>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        ui: state.ui.value,
    };
}

const ToastWidget = connect(mapStateToProps)(BaseToastWidget);
export default ToastWidget;




export class BaseFailToast extends React.PureComponent {
    static propTypes = exact({
        errors: PropTypes.array.isRequired
    })

    render () {
        return <AlertErrors {...this.props} />;
    }
}


const mapFailStateToProps = function(state) {
    return {
        errors: state.ui.value.errors
    };
}

const FailToast = connect(mapFailStateToProps)(BaseFailToast);
export {FailToast};
