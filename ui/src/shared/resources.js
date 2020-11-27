import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import Accordion, {AccordionItem} from './accordion';
import {APIContext} from '../app/context';
import {updateForm, updateUI} from '../app/store';
import {ActionAdd} from './actions';


class BaseResources extends React.PureComponent {
    static contextType = APIContext;
    static propTypes = exact({
        api: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired,
        form: PropTypes.object.isRequired,
        logo: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired,
        title: PropTypes.string.isRequired,
        resources: PropTypes.object.isRequired,
        modal: PropTypes.elementType.isRequired,
        modalTitle: PropTypes.func.isRequired,
        modalAction: PropTypes.string.isRequired,
        modals: PropTypes.object.isRequired,
        editable: PropTypes.bool,
    });

    addResource = async (evt) => {
        // open the add resource modal
        const {dispatch, api} = this.props;
        await dispatch(updateUI({modal: api}));
    };

    createResource = async () => {
        // send API request to create resource
        const {api, dispatch, form} = this.props;
        const {errors: _errors, valid, validation, status, ...data} = form;
        const {errors} = await this.context.post('/' + api + '/add', data);
        if (errors) {
            await dispatch(updateForm({validation: errors}));
        } else {
            await dispatch(updateForm({status: 'initializing'}));
        }
    };

    deleteResource = async (name) => {
        // send API request to delete resource
        const {api, dispatch} = this.props;
        const {errors} = await this.context.post('/' + api + '/delete', {name});
        if (errors) {
            await dispatch(updateForm({validation: errors}));
        }
    };

    editResource = async (evt) => {
        const {api, dispatch, resources} = this.props;
        dispatch(updateForm({...resources[evt.target.title], edit: true}));
        dispatch(updateUI({modal: api}));
    };

    updateResource = async (data) => {
        const {api, dispatch} = this.props;
        const {name, status, ...update} = data;
        const {errors} = await this.context.post('/' + api + '/edit', update);
        if (errors) {
            await dispatch(updateForm({validation: errors}));
        }
    };

    componentDidMount () {
        // create the resource modal
        const {
            api, logo, modal, modals,
            modalAction: action,
            modalTitle: title} = this.props;
        modals[api] = {
            title, modal, action,
            icon: logo,
            onUpdate: this.updateResource,
            onSubmit: this.createResource};
    }

    handleItem = (v) => {
        if (v instanceof Array) {
            return (
                <>
                  {v.map((_v, i) => {
                      return (
                          <div key={i}>
                            <div >{_v.mapping_from}</div>
                            <div >{_v.mapping_to}</div>
                          </div>);
                  })}
                </>
            );
        }
        return <div>{v}</div>;
    };

    render () {
        const {editable, logo, resources, title} = this.props;
        let headerLogo = logo;
        if (logo instanceof Function) {
            headerLogo = logo();
        }

        const _logo = (child) => {
            const {service_type} = child;
            if (service_type) {
                return logo(service_type);
            }
            return logo;
        };
        return (
	    <section className="control-pane">
              <header className="pt-1 pb-1 bg-light">
                <img
                  alt={title}
                  src={headerLogo}
                  className="ml-2 mr-2"
                  width="24px" />
                {title}
                <ActionAdd
                  className="ml-2 mr-2"
                  title={title}
                  add={this.addResource} />
              </header>
              <Accordion
                editable={editable}
                logo={_logo}>
	        {Object.entries(resources).map(([name, content], index) => {
		    return (
                        <AccordionItem
                          key={index}
                          title={name}
                          onEdit={this.editResource}
                          resource={content}
                          onDelete={this.deleteResource}>
	                  {Object.entries(content).map(([k, v], index) => {
                              return (
                                  <dl className="row m-0 bg-light p-0 small" key={index}>
                                    <dt className="col col-sm-4 bg-light text-right text-dark m-0">{k}</dt>
                                    <dd className="col col-sm-8 bg-white m-0">{this.handleItem(v)}</dd>
                                  </dl>
		              );
	                  })}
                        </AccordionItem>
		    );
	        })}
              </Accordion>
            </section>);
    }
}

const mapStateToProps = function(state) {
    return {
        form: state.form.value,
    };
};

const APIResources = connect(mapStateToProps)(BaseResources);
export default APIResources;
