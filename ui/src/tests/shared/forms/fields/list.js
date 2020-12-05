
import each from 'jest-each';
import {shallow} from "enzyme";

import {Col, Row} from 'reactstrap';

import {
    PlaygroundFieldList, PlaygroundFieldListItems,
    PlaygroundFieldListHeaders} from '../../../../shared/forms/fields/list';

let _headers, _keys;

_headers = [[4, 'FOO'], [8, 'BAZ'], [4, 'BAZ']];
_keys = ['A', 'B', 'C'];

const renderTest = [
    [true, [], [], ''],
    [true, [], [], ''],
    [true, [], _keys, '<Row />'],
    [true, _headers, _keys, '<Row />'],
    [false, _headers, _keys, '<Row />'],
];

each(renderTest).test('PlaygroundFieldList render', (_onDelete, headers, keys, expected) => {
    let onDelete;
    if (_onDelete) {
        onDelete = jest.fn();
    }
    const rowFun = jest.fn(v => v);
    let list = shallow(
        <PlaygroundFieldList
          onDelete={onDelete}
          headers={headers}
          row={rowFun}
          keys={keys} />);
    expect(list.text()).toEqual(expected);
    if (expected.length === 0) {
        return;
    }
    const row = list.find(Row);
    expect(row.props().className).toEqual("mt-2 pb-3");
    const col = row.find(Col);
    const fieldHeaders = col.find(PlaygroundFieldListHeaders);
    expect(fieldHeaders.props().headers).toEqual(headers);
    const fieldItems = col.find(PlaygroundFieldListItems);
    expect(fieldItems.props().headers).toEqual(headers);
    expect(fieldItems.props().keys).toEqual(keys);
    expect(fieldItems.props().onDelete).toEqual(onDelete);
    expect(fieldItems.props().row).toEqual(rowFun);
});


test('PlaygroundFieldListItems render', () => {
    const _onDelete = jest.fn();
    const _rowFun = jest.fn(v => [v]);
    let items = shallow(
        <PlaygroundFieldListItems
          onDelete={_onDelete}
          headers={_headers}
          row={_rowFun}
          keys={_keys} />);
    expect(items.text()).toEqual(
        '<PlaygroundFieldListItem /><PlaygroundFieldListItem /><PlaygroundFieldListItem />');
    expect(_rowFun.mock.calls).toEqual([["A"], ["B"], ["C"]]);
    let i = 0;
    for (const k of _keys) {
        expect(items.props().children[i].props).toEqual({
            headers: _headers,
            item: [k],
            name: k,
            onDelete: _onDelete});
        i += 1;
    }
});
