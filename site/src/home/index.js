
import React from 'react';
import exact from 'prop-types-exact';

import EnvoyInverseLogo from '../app/images/logo-inverse.svg';
import GithubLogo from '../app/images/github.svg';
import LinkIcon from '../app/images/link.svg';
import ServiceIcon from '../app/images/service.png';

import PlaygroundSiteServices from './services';
import PlaygroundSiteRepoInfo from './repo';
import PlaygroundSiteLinks from './links';
import PlaygroundSiteWelcome from './welcome';
import {PlaygroundSiteSections} from './section';


export class PlaygroundSiteHome extends React.PureComponent {
    static propTypes = exact({});

    get sections () {
        return [
            [{title: 'Playground',
              icon: EnvoyInverseLogo,
              content: <PlaygroundSiteWelcome />},
             {title: 'Useful links',
              icon: LinkIcon,
              content: <PlaygroundSiteLinks />}],
            [{title: 'Code',
              icon: GithubLogo,
              content: <PlaygroundSiteRepoInfo />},
             {title: 'Playground services',
              icon: ServiceIcon,
              content: <PlaygroundSiteServices />}],
        ];
    }

    render () {
        return (
            <PlaygroundSiteSections
              sections={this.sections} />);
    }
}
