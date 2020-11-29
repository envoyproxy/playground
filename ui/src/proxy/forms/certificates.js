import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import {CustomInput, Col, Row} from 'reactstrap';

import {
    PlaygroundForm, PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../shared/forms';

import CertificateIcon from '../../app/images/certificate.svg';
import {updateForm} from '../../app/store';
import {readFile} from '../../shared/utils';
import {ActionRemove} from '../../shared/actions';


// VALIDATION REQUIRED
//  - certs
//      - number of files
//      - length of each file
//      - valid file extensions for certs ?
//      - valid filenames


const mapStateToProps = function(state, other) {
    return {
        form: state.form.value,
        proxies: state.proxy.value,
        meta: state.meta.value,
    };
};


export class CertificatesListForm extends React.PureComponent {
    static propTypes = exact({
        onDelete: PropTypes.func.isRequired,
        certs: PropTypes.object.isRequired,
    });

    render () {
        const {certs, onDelete} = this.props;
        const title = '';

        if (Object.keys(certs).length === 0) {
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
                  <Col sm={11} className="m-0 p-0">
                    <div className="p-1 bg-dark">
                      Path
                    </div>
                  </Col>
                </Row>
                {Object.keys(certs).map((name, index) => {
                    return (
                        <Row key={index} className="pl-5 pr-5">
                          <Col sm={1} className="m-0 p-0">
                            <div className="p-2 bg-white border-bottom">
                              <ActionRemove
                                title={title}
                                name={title}
                                remove={evt => onDelete(name)} />
                            </div>
                          </Col>
                          <Col sm={11} className="m-0 p-0 border-bottom bg-white">
                            <img
                              alt={name}
                              src={CertificateIcon}
                              width="18px"
                              className="m-2 ml-1 mr-2"  />
                            certs/{name}
                          </Col>
                        </Row>);
                })}
              </Col>
            </Row>);
    }
}


export class BaseProxyCertificatesForm extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
    });

    onChange = async (evt) => {
        const {dispatch, form} = this.props;
        const {certs={}} = form;
        const update = {};
        update[evt.target.files[0].name] = (await readFile(evt.target.files[0])).split(',')[1];
        dispatch(updateForm({certs: {...certs, ...update}}));
    }

    get messages () {
        return [
            "Add certificates and key files required by your proxy.",
            "The files will be accessible to Envoy with the uploaded `filename` in the `certs/` folder."
        ];
    }

    onDelete = async (name) => {
        const {dispatch, form} = this.props;
        const {certs: _certs={}} = form;
        const certs = {..._certs};
        delete certs[name];
        await dispatch(updateForm({certs}));
    }

    render () {
        const {form} = this.props;
        const {certs={}} = form;
        return (
            <PlaygroundForm messages={this.messages}>
              <PlaygroundFormGroup>
                <PlaygroundFormGroupRow
                  label="certificates"
                  title="Add a cert/key">
                  <Col sm={8}>
                    <CustomInput
                      type="file"
                      onInput={this.onChange}
                      id="certificate"
                      name="certificate" />
                  </Col>
                </PlaygroundFormGroupRow>
                <CertificatesListForm
                  onDelete={this.onDelete}
                  certs={{...certs}} />
              </PlaygroundFormGroup>
            </PlaygroundForm>
        );
    }
}

const ProxyCertificatesForm = connect(mapStateToProps)(BaseProxyCertificatesForm);
export {ProxyCertificatesForm};
