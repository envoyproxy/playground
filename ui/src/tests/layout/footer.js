
import {shallow} from "enzyme";

import {Col} from 'reactstrap';

import {Footer} from '../../layout';
import {GithubSnippet} from '../../shared/snippets';


test('Footer render', () => {
    const footer = shallow(<Footer />);
    expect(footer.text()).toEqual('<Col /><Col />');
    const col1 = footer.find(Col).first();
    expect(col1.props().sm).toEqual(6);
    expect(col1.props().children).toEqual();
    const col2 = footer.find(Col).last();
    expect(col2.props().sm).toEqual(6);
    const snippet = col2.find(GithubSnippet);
    expect(snippet.props()).toEqual({});
});
