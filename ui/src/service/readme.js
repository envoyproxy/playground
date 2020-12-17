
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';

import {PlaygroundContext} from '../app';


export class BaseServiceReadme extends React.Component {
    static contextType = PlaygroundContext;
    static propTypes = exact({
        service_type: PropTypes.string.isRequired,
        service_types: PropTypes.object.isRequired,
        dispatch: PropTypes.func,
    });

    state = {content: ''}

    get service_type () {
        const {service_type, service_types} = this.props;
        return service_types[service_type] || {};
    }

    get service_config () {
        const {image, labels={}} = this.service_type;
        return {
            logo: labels['envoy.playground.logo'],
            readme: labels['envoy.playground.readme'],
            title: labels['envoy.playground.service'],
            description: labels['envoy.playground.description'],
            image};
    }

    updateReadme = async () => {
        const {service_type} = this.props;
        const {readme} = this.service_config;
        const {api} = this.context;
        const content = await api.get(
            ['/static', service_type, readme].join('/'),
            'text');
        this.setState({content});
    };

    async componentDidMount () {
        await this.updateReadme();
    }

    async componentDidUpdate (prevProps) {
        const {service_type} = this.props;
        if (service_type !== prevProps.service_type) {
            await this.updateReadme();
        }
    }

    render () {
        const {api, urls} = this.context;
        const {content} = this.state;
        const {service_type} = this.props;
        const {
            image, logo, title, description} = this.service_config;
        const _logo = api.address(
            ['/static',
             service_type,
             logo].join('/'));
        const imageURL = urls.docker(image);
        return (
            <div className="readme m-2 mt-3 bg-light p-2 pt-3 pl-3">
              <img src={_logo} alt="service logo" className="float-right m-2" width="50px" />
              <h4>{title}</h4>
              {description &&
               <h5 className="text-secondary">{description}</h5>
              }
              <p className="bg-dark p-2 mt-3">image: <a href={imageURL}>{image}</a></p>
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
        );
    }
}


export const mapStateToProps = function(state, other) {
    return {
        service_types: state.service_type.value,
    };
};

export default connect(mapStateToProps)(BaseServiceReadme);
