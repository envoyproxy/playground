
import Yaml from 'js-yaml';

import TimeAgo from 'javascript-time-ago';

import en from 'javascript-time-ago/locale/en';

import ServiceConfig from '../services.yaml';
import {updateRepo, updateServices} from './store';


export default class PlaygroundSite {
    repository = "https://github.com/envoyproxy/playground";
    services = ServiceConfig;

    constructor (store) {
        this.store = store;
        TimeAgo.addDefaultLocale(en);
        this.ago = new TimeAgo('en');
    }

    json = async (url) => {
        const response = await fetch(url);
        // todo: add etag handling
        return await response.json();
    };

    load = async () => {
        await this.loadRepository();
        await this.loadServices();
    };

    loadRepository = async () => {
        const {dispatch} = this.store;
        const {events_url, open_issues_count: issues} = await this.json(this.repository);
        const events = await this.json(events_url);
        await dispatch(updateRepo({
            events,
            issues}));
    };

    loadServices = async () => {
        const {dispatch} = this.store;
        const {services} = await this.yaml(this.services);
        await dispatch(updateServices(services));
    };

    yaml = async (url) => {
        const response = await fetch(url);
        return Yaml.safeLoad(await response.text());
    }
}
