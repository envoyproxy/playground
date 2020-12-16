
import {shallow} from "enzyme";

import EnvoyInverseLogo from '../../app/images/logo-inverse.svg';
import GithubLogo from '../../app/images/github.svg';
import LinkIcon from '../../app/images/link.svg';
import ServiceIcon from '../../app/images/service.png';
import PlaygroundSiteServices from '../../home/services';
import PlaygroundSiteRepoInfo from '../../home/repo';
import PlaygroundSiteLinks from '../../home/links';
import PlaygroundSiteWelcome from '../../home/welcome';
import {PlaygroundSiteSections} from '../../home/section';
import {PlaygroundSiteHome} from '../../home';


test('PlaygroundSiteHome render', () => {
    const home = shallow(<PlaygroundSiteHome />);
    expect(home.text()).toEqual('<PlaygroundSiteSections />');
    const nav = home.find(PlaygroundSiteSections);
    expect(nav.props()).toEqual({
        sections: home.instance().sections});
    expect(home.instance().sections).toEqual([
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
          content: <PlaygroundSiteServices />}]]);
});
