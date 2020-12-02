import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Toast, ToastHeader, ToastBody} from 'reactstrap';

import {updateUI} from '../app/store';
import {ToastContext} from '../app/context';


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
            toast: Content, name,
            title, icon='danger'} = this.props;
        return (
            <>
              <ToastHeader
                toggle={this.toggle}
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
    static contextType = ToastContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        ui: PropTypes.object.isRequired,
        className: PropTypes.string,
    });

    render () {
        const {className, dispatch, ui} = this.props;
        const {toast} = ui;
        const isOpen = Boolean(toast);
        return (
            <>
              <Toast
                isOpen={isOpen}
                toggle={this.close}
                className={className}>
                {isOpen &&
                 <ToastParts
                   dispatch={dispatch}
                   {...this.context[toast]} />
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
