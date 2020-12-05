
import {Col, Row} from 'reactstrap';

import {
    PlaygroundFieldList, PlaygroundFieldListItems,
    PlaygroundFieldListHeaders} from '../../../../shared/forms/fields/list';

import {shallow} from "enzyme";


test('PlaygroundFieldList render', () => {
    const onDelete = jest.fn();
    const rowFun = jest.fn();
    const headers = [[4, 'FOO'], [8, 'BAZ'], [4, 'BAZ']];
    const keys = ['A', 'B', 'C'];
    let list = shallow(
        <PlaygroundFieldList
          onDelete={onDelete}
          headers={[]}
          row={rowFun}
          keys={[]} />);
    expect(list.text()).toEqual('');
    list = shallow(
        <PlaygroundFieldList
          onDelete={onDelete}
          headers={headers}
          row={rowFun}
          keys={[]} />);
    expect(list.text()).toEqual('');
    list = shallow(
        <PlaygroundFieldList
          onDelete={onDelete}
          headers={[]}
          row={rowFun}
          keys={keys} />);
    expect(list.text()).toEqual('<Row />');
    list = shallow(
        <PlaygroundFieldList
          onDelete={onDelete}
          headers={headers}
          row={rowFun}
          keys={keys} />);
    expect(list.text()).toEqual('<Row />');
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
