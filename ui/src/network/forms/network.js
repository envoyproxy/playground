import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col, Label, Row} from 'reactstrap';
import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundInput} from '../../shared/forms';
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

    onChange = async (evt) => {
        const {dispatch, networks, meta} = this.props;
        const {max_name_length, min_name_length} = meta;
        let valid = true;
        const errors = {name: []};
        if (evt.currentTarget.value.length < parseInt(min_name_length)) {
            valid = false;
        }
        if (evt.currentTarget.value.length > parseInt(max_name_length)) {
            valid = false;
            errors.name.push('Network name too long, maximum ' + max_name_length + ' chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (evt.currentTarget.value.indexOf(forbidden) !== -1) {
                valid = false;
                errors.name.push('Network name cannot contain \'' + forbidden + '\'');
            }
        }
        const name = evt.currentTarget.value.toLowerCase();
        if (name.length > 0 && !name.match(/[a-z]+[a-z0-9.\-_]*$/)) {
            valid = false;
            errors.name.push('Network name contains forbidden characters');
        }
        if (Object.keys(networks).indexOf(name) !== -1) {
            valid = false;
            errors.name.push('Network name exists already');
        }

        if (valid) {
            delete errors.name;
        }
        dispatch(updateForm({errors, valid, name}));
    }

    render () {
        const {form} = this.props;
        const {edit, errors={}, name} = form;
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
		    <PlaygroundInput
                      name="name"
                      placeholder="Enter network name"
                      disabled={edit}
                      errors={errors}
                      value={name || ''}
                      onChange={this.onChange}
                    />
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
