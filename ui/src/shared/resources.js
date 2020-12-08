import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import Accordion, {AccordionItem} from './accordion';
import {PlaygroundContext} from '../app/context';
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
        even: PropTypes.bool.isRequired,
        handleItem: PropTypes.func.isRequired,
    })

    render () {
        const {k, v, handleItem, even} = this.props;
        let color = 'bg-light';
        if (even) {
            color = 'bg-white';
        }
        return (
            <dl className="row m-0 bg-light p-0 small">
              <dt className="col col-sm-4 bg-light border-bottom text-right text-dark m-0 pt-1 pb-1">{k}</dt>
              <dd className={"col col-sm-8 pt-1 pb-1 m-0 " + color}>
                {handleItem(k, v)}
              </dd>
            </dl>);
    }

}

class BaseResources extends React.PureComponent {
    static contextType = PlaygroundContext;
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
        addModal: PropTypes.object.isRequired,
        editable: PropTypes.bool,
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
        await dispatch(updateForm({status: 'initializing'}));
        const {errors} = await this.context.api.post('/' + api + '/add', data);
        if (errors) {
            await dispatch(updateForm({validation: errors, status: ''}));
        }
    };

    deleteResource = async (id) => {
        // send API request to delete resource
        const {api, dispatch} = this.props;
        const {errors} = await this.context.api.post('/' + api + '/delete', {id});
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
        const {errors} = await this.context.api.post('/' + api + '/edit', update);
        if (errors) {
            await dispatch(updateForm({validation: errors}));
        }
    };

    componentDidMount () {
        // create the resource modal
        const {
            api, addModal, logo} = this.props;
        const {
            action, editAction, editClose,
            modal, title} = addModal;
        const {modals} =  this.context;
        modals[api] = {
            title, modal, action,
            editAction, editClose,
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
              <header className="pt-1 pb-1 bg-dark border-top border-bottom">
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
              <div className="p-0 pt-1 bg-medium scrollable">
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
                                      even={Boolean(i % 2)}
                                    handleItem={this.handleItem}
                                    />);
	                    })}
                          </AccordionItem>
		      );
	          })}
                </Accordion>
              </div>
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
