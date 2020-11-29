import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {Col, Label, Input, Row} from 'reactstrap';

import {PlaygroundForm, PlaygroundFormGroup} from '../../shared/forms';
import {updateForm} from '../../app/store';


export class BaseNetworkProxiesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    });

    get messages () {
        return ["Add and remove proxies from this network"];
    }

    onChange = async (evt) => {
        const {dispatch, form, networks, onUpdate} = this.props;
        const {edit, proxies=[], ...data} = form;
        const {name} =  data;
        let _proxies;
        if (edit) {
            _proxies = [...(networks[name].proxies || [])];
        } else {
            _proxies = [...proxies];
        }
        if (evt.currentTarget.checked) {
            _proxies.push(evt.currentTarget.name);
        } else {
            _proxies = _proxies.filter(i => i !== evt.currentTarget.name);
        }
        if (edit) {
            await dispatch(updateForm({proxies: _proxies}));
            await onUpdate({...data, proxies: _proxies});
        } else {
            await dispatch(updateForm({proxies: _proxies}));
        }
    };

    render () {
        const  {form, proxies, networks} = this.props;
        const {edit, name} = form;
        return (
            <PlaygroundForm
              messages={this.messages}>
              <PlaygroundFormGroup check>
                {Object.entries(proxies).map(([k, v], i) => {
                    let checked  = (form.proxies || []).indexOf(k) !== -1;
                    if (edit) {
                        checked = (networks[name].proxies || []).indexOf(k) !== -1;
                    }
                    return (
                        <Row className="p-1 pl-3 ml-2" key={i}>
                          <Col sm={10} >
                            <Label check>
                              <Input
                                type="checkbox"
                                name={k}
                                onChange={this.onChange}
                                checked={checked} />
                              <div className="ml-1">
                                {k}
                              </div>
                            </Label>
                          </Col>
                        </Row>);
                })}
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}


const mapNetworkStateToProps = function(state, other) {
    return {
        networks: state.network.value,
        proxies: state.proxy.value,
        form: state.form.value,
    };
}

const NetworkProxiesForm = connect(mapNetworkStateToProps)(BaseNetworkProxiesForm);
export {NetworkProxiesForm};
