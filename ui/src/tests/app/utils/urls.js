
import each from 'jest-each';

import {PlaygroundURLs} from '../../../app/utils';


const urlTest = [
    ['foo', 'https://hub.docker.com/_/foo'],
    ['foo/bar', "https://hub.docker.com/r/foo/bar"]];


each(urlTest).test('PlaygroundURLs docker', (image, url) => {
    const urls = new PlaygroundURLs();
    expect(urls.docker(image)).toEqual(url);
});
