import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {PlaygroundForm, PlaygroundNameInput} from '../../shared/forms';
import {updateForm} from '../../app/store';


export class BaseNetworkForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        networks: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Add a named network. You can add proxies and services to the network."];
    }

    onNameChange = async (evt) => {
        const {dispatch} = this.props;
        await dispatch(updateForm(evt));
    }

    get groups () {
        const {form, networks} = this.props;
        const {errors={}, name} = form;
        return [
            [{title: 'Name*',
              label: 'name',
              cols: [
                  [9,
	           <PlaygroundNameInput
                     placeholder="Enter network name"
                     errors={errors}
                     value={name}
                     taken={Object.keys(networks)}
                     onChange={this.onNameChange} />]]}]];
    }

    render () {
        return (
            <PlaygroundForm
              groups={this.groups}
              messages={this.messages} />
        );
    }
}


export const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        networks: state.network.value,
    };
};

export default connect(mapStateToProps)(BaseNetworkForm);
