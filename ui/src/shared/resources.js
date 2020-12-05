import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import Accordion, {AccordionItem} from './accordion';
import {APIContext} from '../app/context';
import {clearForm, updateForm, updateUI} from '../app/store';
import {ActionAdd} from './actions';
import {URLMangler} from './utils';


class ResourceInfoItem extends React.PureComponent {
    static propTypes = exact({
        k: PropTypes.string.isRequired,
        v: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.array,
        ]).isRequired,
        handleItem: PropTypes.func.isRequired,
    })

    render () {
        const {k, v, handleItem} = this.props;
        return (
            <dl className="row m-0 bg-light p-0 small">
              <dt className="col col-sm-4 bg-light text-right text-dark m-0">{k}</dt>
              <dd className="col col-sm-8 bg-white m-0">
                {handleItem(k, v)}
              </dd>
            </dl>);
    }

}

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
        editClose: PropTypes.string,
        editAction: PropTypes.string,
    });

    addResource = async (evt) => {
        // open the add resource modal
        const {dispatch, api} = this.props;
        await dispatch(clearForm());
        await dispatch(updateUI({modal: api}));
    };

    createResource = async () => {
        // send API request to create resource
        const {api, dispatch, form} = this.props;
        const {errors: _errors, env, logs, valid, validation, status, vars, ...data} = form;
        data.env = env || vars;
        const {errors} = await this.context.post('/' + api + '/add', data);
        if (errors) {
            await dispatch(updateForm({validation: errors}));
        } else {
            await dispatch(updateForm({status: 'initializing'}));
        }
    };

    deleteResource = async (id) => {
        // send API request to delete resource
        const {api, dispatch} = this.props;
        const {errors} = await this.context.post('/' + api + '/delete', {id});
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
            editAction, editClose,
            modalAction: action,
            modalTitle: title} = this.props;
        modals[api] = {
            title, modal, action, editAction, editClose,
            icon: logo,
            onUpdate: this.updateResource,
            onSubmit: this.createResource};
    }

    handleItem = (k, v) => {
        // this needs to move out of here...
        if (k === 'port_mappings' && v) {
            return (
                <>
                  {v.map((_v, i) => {
                      return (
                          <div key={i}>
                            <div >{_v.mapping_from} -> {_v.mapping_to}</div>
                          </div>);
                  })}
                </>);
        } else if (v instanceof Array) {
            return (
                <>
                  {v.map((_v, i) => {
                      return (
                          <div key={i}>
                            <div >{_v}</div>
                          </div>);
                  })}
                </>
            );
        } else if (k === 'image') {
            let imageURL = new URLMangler().docker(v);
            return (
                <a href={imageURL}>
                    {v}
                </a>);
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
                    const {id} = content;
		    return (
                        <AccordionItem
                          key={index}
                          title={name}
                          id={id}
                          onEdit={this.editResource}
                          resource={content}
                          onDelete={this.deleteResource}>
	                  {Object.entries(content).map(([k, v], i) => {
                              return (
                                  <ResourceInfoItem
                                    key={i}
                                    k={k}
                                    v={v}
                                    handleItem={this.handleItem}
                                  />);
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
