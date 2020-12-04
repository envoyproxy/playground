import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import ReactMarkdown from 'react-markdown';

import {URLMangler} from '../shared/utils';


export class ServiceReadme extends React.Component {
    static propTypes = exact({
        readme: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        logo: PropTypes.string.isRequired,
        service_type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
    });

    state = {content: ''}

    getReadmeURL = () => {
        const {readme, service_type} = this.props;
        return [
            'http://localhost:8000/static',
            service_type,
            readme].join('/');
    }

    updateReadme = async () => {
        const response = await fetch(this.getReadmeURL());
        const content = await response.text();
        console.log("README", content);
        this.setState({content});
    };

    async componentDidMount () {
        await this.updateReadme();
    }

    async componentDidUpdate (prevProps) {
        const {readme, service_type} = this.props;
        if (readme !== prevProps.readme || service_type !== prevProps.service_type) {
            await this.updateReadme();
        }
    }

    render () {
        const {content} = this.state;
        const {
            image, logo, title, description,
            service_type} = this.props;
        const _logo = [
            'http://localhost:8000/static',
            service_type,
            logo].join('/');
        const imageURL = new URLMangler().docker(image);
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
