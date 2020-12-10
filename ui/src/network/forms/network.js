import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col, Label, Row} from 'reactstrap';
import {
    PlaygroundForm, PlaygroundFormGroup, PlaygroundNameInput} from '../../shared/forms';
import {updateForm} from '../../app/store';


class BaseNetworkForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        networks: PropTypes.object.isRequired,
    });

    get messages () {
        return ["Add a named network. You can add proxies and services to the network."];
    }

    onNameChange = async (evt) => {
        const {dispatch} = this.props;
        await dispatch(updateForm(evt));
    }

    render () {
        const {form, meta, networks} = this.props;
        const {errors={}, name} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
              <PlaygroundFormGroup>
                <Row>
                  <Label sm={3}  for="name" className="text-right">
                    <div>
                      Name
                    </div>
                  </Label>
                  <Col sm={9}>
	            <PlaygroundNameInput
                      placeholder="Enter network name"
                      errors={errors}
                      value={name}
                      meta={meta}
                      taken={Object.keys(networks)}
                      onChange={this.onNameChange} />
                  </Col>
                </Row>
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        meta: state.meta.value,
        networks: state.network.value,
    };
}

const NetworkForm = connect(mapStateToProps)(BaseNetworkForm);
export {NetworkForm};
