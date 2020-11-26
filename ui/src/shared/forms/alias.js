import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Button, Col, Input, Row } from 'reactstrap';

import {updateForm} from '../../app/store';

import CloudLogo from '../../images/cloud.svg';
import {ActionRemove} from '../actions';
import {PlaygroundForm, PlaygroundFormGroup, PlaygroundFormGroupRow} from './base';


// VALIDATION REQUIRED
//  - alias:
//      - valid network alias


export class AliasListForm extends React.PureComponent {
    static propTypes = exact({
        aliases: PropTypes.array,
    });

    render () {
        const {aliases=[]} = this.props;
        const onDelete = null;
        const title = '';

        if (aliases.length === 0) {
            return '';
        }
        return (
            <Row className="mt-2 pb-3">
              <Col>
                <Row className="pl-5 pr-5">
                  <Col sm={1} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <span>&nbsp;</span>
                    </div>
                  </Col>
                  <Col sm={3} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      <img
                        alt={title}
                        src={CloudLogo}
                        width="22px"
                        className="ml-1 mr-2"  />
                      Network/s
                    </div>
                  </Col>
                  <Col sm={8} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Alias
                    </div>
                  </Col>
                </Row>
                {aliases.map((alias, index) => {
                    const parts = alias.split(":");
                    let network;
                    const name = parts[1];
                    if (parts[0].length === 0) {
                        network = "*";
                    } else {
                        network = parts[0];
                    }
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white">
                              <ActionRemove
                                title={title}
                                name={title}
                                remove={evt => this.onDelete(evt, onDelete)} />
                            </div>
                          </Col>
                          <Col sm={3} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {network}
                            </div>
                          </Col>
                          <Col sm={8} className="m-0 p-0 border-bottom">
                            <div className="p-2 bg-white">
                              {name}
                            </div>
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BaseAliasForm extends React.Component {
    static propTypes = exact({
        dispatch: PropTypes.func,
        form: PropTypes.object.isRequired,
    });

    state = {alias: '', network: ''};

    onClick = (evt) => {
        const {alias, network} = this.state;
        const {dispatch, form} = this.props;
        const {aliases=[]} = form;
        const newAliases = [...aliases, network + ":" + alias];
        this.setState({alias: '', network: ''});
        dispatch(updateForm({aliases: newAliases}));
    }

    onChange = (evt) => {
        const update = {};
        update[evt.target.name] = evt.target.value;
        this.setState({...update});
    }

    get messages () {
        return [
            "Add network aliases for your proxy.",
            "Your proxy will be addressable by other proxies or services with this name",
            "You can restrict which networks an alias is used for with a glob match, default is *",
        ];
    }

    render () {
        const {alias, network} = this.state;
        const {form} = this.props;
        const {aliases=[]} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="alias"
                  title="Add alias">
                  <Col sm={3}>
                    <Input
                      type="text"
                      onChange={this.onChange}
                      value={network}
                      id="network"
                      name="network"
                      placeholder="*" />
                  </Col>
                  <Col sm={4}>
                    <Input
                      type="text"
                      onChange={this.onChange}
                      value={alias}
                      name="alias"
                      id="alias"
                      placeholder="Alias" />
                  </Col>
                  <Col sm={2}>
                    <Button
                      color="success"
                      onClick={this.onClick}>+</Button>
                  </Col>
                </PlaygroundFormGroupRow>
                <AliasListForm aliases={[...aliases]} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}
