
import {shallow} from "enzyme";

import {Col, CustomInput} from 'reactstrap';

import {
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from '../../../../shared/forms';
import {
    PlaygroundFilesField, PlaygroundFilesFieldList,
    PlaygroundFilesFieldChooser} from '../../../../shared/forms/fields/files';


test('PlaygroundFilesField render', () => {
    const onChange = jest.fn();
    const onDelete = jest.fn();
    const _files = [];
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
    const chooser = group.find(PlaygroundFilesFieldChooser);
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


test('PlaygroundFilesFieldChooser render', () => {
    const onChange = jest.fn();
    let chooser = shallow(
        <PlaygroundFilesFieldChooser
          onChange={onChange}
          title='TITLE'
          name='NAME'
        />);
    expect(chooser.text()).toEqual(
        "<PlaygroundFormGroupRow />");
    const row = chooser.find(PlaygroundFormGroupRow);
    expect(row.props().label).toEqual('NAME');
    expect(row.props().title).toEqual('TITLE');
    const col = chooser.find(Col);
    expect(col.props().sm).toEqual(8);
    const input = col.find(CustomInput);
    expect(input.props().type).toEqual('file');
    expect(input.props().onInput).toEqual(onChange);
    expect(input.props().id).toEqual('NAME');
    expect(input.props().name).toEqual('NAME');
});


test('PlaygroundFilesFieldList render', () => {
    const onDelete = jest.fn();
    const _files = ['F1', 'F2'];
    const list = shallow(
        <PlaygroundFilesFieldList
          onDelete={onDelete}
          prefix='PREFIX'
          icon='ICON'
          files={_files}
        />);
    expect(list.text()).toEqual(
        "<PlaygroundFieldList />");
    expect(list.props().headers).toEqual([[11, "Path"]]);
    expect(list.props().row).toEqual(list.instance().row);
    expect(list.props().keys).toEqual(_files);
    const row = list.instance().row('NAME');
    expect(row.length).toEqual(1);
    expect(row[0].props.children[0].props).toEqual({
        alt: 'NAME',
        src: 'ICON',
        width: '18px',
        className: 'm-2 ml-1 mr-2'});
    expect(row[0].props.children[1]).toEqual('PREFIX');
    expect(row[0].props.children[2]).toEqual('NAME');
});
