
import Yaml from 'js-yaml';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import {PlaygroundSite} from '../../app';
import {updateRepo, updateServices} from '../../app/store';
import ServiceConfig from '../../services.yaml';


jest.mock('javascript-time-ago');
jest.mock('js-yaml');

jest.mock('../../app/store');


test('PlaygroundSite constructor', () => {
    const store = {key: 'VALUE'};
    const site = new PlaygroundSite(store);
    expect(site.services).toEqual(ServiceConfig);
    expect(site.repository).toEqual("https://github.com/envoyproxy/playground");
    expect(site.repoAPI).toEqual('https://api.github.com/repos/envoyproxy/playground');
    expect(site.store).toEqual(store);
    expect(TimeAgo.addDefaultLocale.mock.calls).toEqual([[en]]);
    expect(TimeAgo.mock.calls).toEqual([['en']]);
    expect(site.ago).toEqual(TimeAgo.mock.instances[0]);
});


test('PlaygroundSite json', async () => {
    const _fetch = window.fetch;
    window.fetch = jest.fn(async () => ({json: jest.fn(async () => 'JSON RESULT')}));
    const store = {key: 'VALUE'};
    const site = new PlaygroundSite(store);
    expect(await site.json('SOMEURL')).toEqual('JSON RESULT');
    window.fetch = _fetch;
});


test('PlaygroundSite load', async () => {
    const store = {key: 'VALUE'};
    const site = new PlaygroundSite(store);
    site.loadRepository = jest.fn(async () => {});
    site.loadServices = jest.fn(async () => {});
    await site.load();
    expect(site.loadRepository.mock.calls).toEqual([[]]);
    expect(site.loadServices.mock.calls).toEqual([[]]);
});


test('PlaygroundSite loadServices', async () => {
    updateServices.mockImplementation(() => 'UPDATED');
    const store = {dispatch: jest.fn()};
    const site = new PlaygroundSite(store);
    site.yaml = jest.fn(async () => ({services: 'SERVICES'}));
    await site.loadServices();
    expect(site.yaml.mock.calls).toEqual([[site.services]]);
    expect(updateServices.mock.calls).toEqual([['SERVICES']]);
    expect(store.dispatch.mock.calls).toEqual([['UPDATED']]);
});


test('PlaygroundSite loadRepository', async () => {
    updateRepo.mockImplementation(() => 'UPDATED');
    const store = {dispatch: jest.fn()};
    const site = new PlaygroundSite(store);
    const jsonResponse = {events_url: 'EVENTS URL', open_issues_count: 23};
    site.json = jest.fn(async () => (jsonResponse));
    await site.loadRepository();
    expect(site.json.mock.calls).toEqual([[site.repoAPI], ['EVENTS URL']]);
    expect(updateRepo.mock.calls).toEqual([[{events: jsonResponse, issues: 23}]]);
    expect(store.dispatch.mock.calls).toEqual([['UPDATED']]);
});


test('PlaygroundSite yaml', async () => {
    const _fetch = window.fetch;
    window.fetch = jest.fn(async () => ({text: jest.fn(async () => 'RAW YAML')}));
    const store = {key: 'VALUE'};
    const site = new PlaygroundSite(store);
    Yaml.safeLoad.mockImplementation(() => 'YAML RESULT');
    expect(await site.yaml('SOMEURL')).toEqual('YAML RESULT');
    expect(Yaml.safeLoad.mock.calls).toEqual([['RAW YAML']]);
    window.fetch = _fetch;
});
