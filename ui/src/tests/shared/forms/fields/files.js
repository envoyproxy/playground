
import {shallow} from "enzyme";

import {
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../../../shared/forms';
import {
    PlaygroundFilesField, PlaygroundFilesFieldList,
    PlaygroundFilesFieldChooser} from '../../../../shared/forms/fields/files';


test('PlaygroundFilesField render', () => {
    const onChange = jest.fn();
    const onDelete = jest.fn();
    const _files = {};
    let files = shallow(
        <PlaygroundFilesField
          onDelete={onDelete}
          onChange={onChange}
          files={_files}
          icon='ICON'
          prefix='PREFIX'
          title='TITLE'
          name='NAME'
        />);
    expect(files.text()).toEqual(
        "<PlaygroundFormGroup />");
    const group = files.find(PlaygroundFormGroup);
    const chooser = files.find(PlaygroundFilesFieldChooser);
    expect(chooser.props()).toEqual({
        "name": "NAME",
        "onChange": onChange,
        "title": "TITLE"});
    const list = files.find(PlaygroundFilesFieldList);
    expect(list.props()).toEqual({
        "files": _files,
        "icon": 'ICON',
        "prefix": 'PREFIX',
        "onDelete": onDelete});
});
