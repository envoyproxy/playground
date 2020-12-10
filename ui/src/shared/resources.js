import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {connect} from 'react-redux';

import Accordion, {AccordionItem} from './accordion';
import {PlaygroundContext} from '../app/context';
import {ActionAdd} from './actions';
import {PlaygroundSection} from './section';
import {URLMangler} from './utils';


class ResourceInfoItem extends React.PureComponent {
    static propTypes = exact({
        k: PropTypes.string.isRequired,
        v: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.array,
        ]),
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

class BaseResources extends React.Component {
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

    state = {removing: []};

    get api () {
        const {api} = this.props;
        const {api: _api} = this.context;
        return _api[api];
    }

    delete = async (id) => {
        // send API request to delete resource
        // todo: move this to a store var
        this.setState(state => {
            state.removing.push(id);
            return state;
        });
        await this.api.delete(id);
    };

    edit = async (evt) => {
        // send API request to edit resource
        const {title} = evt.target;
        await this.api.edit(title);
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
            onUpdate: this.api.update,
            onSubmit: this.api.create};
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
            // todo: attach mangler to playground obj
            let imageURL = new URLMangler().docker(v);
            return (
                <a href={imageURL}>
                    {v}
                </a>);
        }
        return <div>{v}</div>;
    };

    renderTitle = (title) => {
        return (
            <>
              {title}
              <ActionAdd
                className="ml-2 mr-2"
                title={title}
                add={this.api.add} />
            </>);
    }

    getLogo = (child) => {
        const {logo} = this.props;
        if (logo instanceof Function) {
            return logo(child);
        }
        return logo;
    };


    render () {
        const {editable, logo, resources, title} = this.props;
        const {removing} = this.state;
        let headerLogo = logo;
        if (logo instanceof Function) {
            headerLogo = logo();
        }
        return (
            <PlaygroundSection
              title={this.renderTitle(title)}
              icon={headerLogo}>
                <Accordion
                  editable={editable}
                  logo={this.getLogo}>
                  {Object.entries(resources).map(([name, content], index) => {
                      const {id} = content;
                      let className = '';
                      if (removing.indexOf(id) !== -1) {
                          className = 'removing';
                      }
                      return (
                          <AccordionItem
                            key={index}
                            title={name}
                            id={id}
                            className={className}
                            onEdit={this.edit}
                            resource={content}
                            onDelete={this.delete}>
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
            </PlaygroundSection>);
    }
}


const mapStateToProps = function(state) {
    return {
        form: state.form.value,
    };
};

const APIResources = connect(mapStateToProps)(BaseResources);
export default APIResources;
