import Yaml from 'js-yaml';

import TimeAgo from 'javascript-time-ago';

import en from 'javascript-time-ago/locale/en';

import ServiceConfig from '../services.yaml';
import {updateRepo, updateServices} from './store';


export default class PlaygroundSite {

    constructor (store) {
        this.store = store;
        TimeAgo.addDefaultLocale(en);
        this.ago = new TimeAgo('en');
    }

    load = async () => {
        const {dispatch} = this.store;
        const response = await fetch('https://api.github.com/repos/envoyproxy/playground');
        const content = await response.json();
        const {events_url, open_issues_count: issues} = content;
        const eventsResponse = await fetch(events_url);
        // todo: add etag handling
        const events = await eventsResponse.json();
        await dispatch(updateRepo({
            events,
            issues}));
        const response2 = await fetch(ServiceConfig);
        const content2 = await response2.text();
        const {services} = Yaml.safeLoad(content2);
        await dispatch(updateServices(services));
    };
}
