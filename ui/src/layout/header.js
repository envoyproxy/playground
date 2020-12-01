import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {CustomInput, Col} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../shared/forms';
import {
    ActionClear,
    ActionLoad, ActionSave} from '../shared/actions';
import {APIContext, ModalContext} from '../app/context';
import EnvoyLogo from '../app/images/envoy.svg';
import {updateUI} from '../app/store';


class HeaderActions extends React.PureComponent {
    static contextType = APIContext

    clear = async () => {
        await this.context.get('/clear');
    };

    save = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'not-implemented'}));
    };

    load = async () => {
        const {dispatch} = this.props;
        dispatch(updateUI({modal: 'load'}));
    };

    render () {
        return (
            <>
              <ActionClear
                className="ml-2 mb-0 float-right mt-1 mr-5"
                clear={this.clear} />
              <ActionLoad load={this.load} />
              <ActionSave save={this.save} />
            </>);
    }
}

export class BaseLoadPlaygroundForm extends React.PureComponent {

    get messages () {
        return [
            "Select an example playground setup.",
        ];
    }

    render () {
        const {examples} = this.props;
        const {playground} = examples;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="examples"
                  title="Playground examples">
                  <Col sm={8}>
                    <CustomInput
                      type="select"
                      id="default-level"
                      onChange={this.onChange}
                      name="default-level">
                      <option>Select an example</option>);
                      {Object.keys(playground).map((k, i) => {
                          return (
                              <option key={i}>{k}</option>);
                          })}
                    </CustomInput>
                  </Col>
                </PlaygroundFormGroupRow>
              </PlaygroundFormGroup>
            </PlaygroundForm>);
    }

}


const mapExampleStateToProps = function(state) {
    return {
        examples: state.example.value,
    };
}

const LoadPlaygroundForm = connect(mapExampleStateToProps)(BaseLoadPlaygroundForm);
export {LoadPlaygroundForm}


export class LoadPlaygroundModal extends React.PureComponent {

    render () {
        return (
            <>
              <LoadPlaygroundForm  />
            </>);
    }

}

class BaseHeader extends React.PureComponent {
    static contextType = ModalContext;
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        version: PropTypes.string,
    });

    componentDidMount () {
        this.context['load'] = {
            modal: LoadPlaygroundModal,
            title: () => "Load playground"};
    }

    render () {
        const {dispatch, version} = this.props;
        return (
            <header className="App-header bg-dark border-bottom border-dark">
              <img
                alt="Envoy logo"
                src={EnvoyLogo}
                width="28px"
                className="ml-1 mr-2" />
	      <span>Envoy playground ({version})</span>
              <HeaderActions
                dispatch={dispatch} />
            </header>);
    }
}

const mapStateToProps = function(state) {
    return {
        version: state.meta.value.version,
    };
}

const Header = connect(mapStateToProps)(BaseHeader);
export default Header;
