
import each from 'jest-each';

import {shallow} from "enzyme";

import {LazyLog} from 'react-lazylog';

import {Col, Row} from 'reactstrap';

import {
    PlaygroundFailLogs, PlaygroundLazyLog} from '../../shared/logs';


let getHighlight = jest.fn();


class DummyPlaygroundFailLogs extends PlaygroundFailLogs {
    getHighlight = getHighlight;
}


test('PlaygroundFailLogs render', () => {
    const _logs = ['LOG1', 'LOG2'];
    getHighlight = jest.fn(() => (['START', 'STOP']));
    const logs = shallow(
        <DummyPlaygroundFailLogs
          logs={_logs} />);
    expect(logs.text()).toEqual('<PlaygroundLazyLog />');
    const lazy = logs.find(PlaygroundLazyLog);
    expect(getHighlight.mock.calls).toEqual([[]]);
    expect(lazy.props()).toEqual({"highlight": ['START', 'STOP'], "logs": ['LOG1', 'LOG2']});
});


const logsTest = [
    [['L1', 'L2'], []],
    [['L1', 'L2', 'L3'], []],
    [['L1', 'L2', 'eRror'], [3, 3]],
    [['L1', 'L2', 'eRror', 'L4'], [3, 3]],
    [['L1', 'L2', 'eRror', 'L4', 'L5'], [3, 3]],
    [['eRror', 'L2', 'L3', 'L4', 'L5'], [1, 1]],
    [['eRror', 'L2', 'INVALID', 'L4', 'L5'], [1, 3]],
    [['L1', 'eRror', 'L3', 'INVALID', 'L5', 'invaLId', 'L7'], [2, 6]],
];


each(logsTest).test('PlaygroundFailLogs getHighlight', (_logs, expected) => {
    const logs = shallow(
        <PlaygroundFailLogs
          logs={_logs} />);
    expect(logs.instance().getHighlight()).toEqual(expected);
});


test('PlaygroundLazyLog render', () => {
    const logs = ['LOG1\n', 'LOG2\n'];
    const lazy = shallow(
        <PlaygroundLazyLog
          logs={logs} />);
    expect(lazy.text()).toEqual('<t />');
    const div = lazy.find('div');
    expect(div.props().className).toEqual("playground-lazy-log");
    const _lazy = lazy.find(LazyLog);
    expect(_lazy.props().text).toEqual('LOG1\nLOG2\n');
    expect(_lazy.props().highlight).toEqual([]);
    expect(_lazy.props().extraLines).toEqual(2);
});


test('PlaygroundLazyLog render props', () => {
    const logs = ['LOG1\n', 'LOG2\n'];
    const lazy = shallow(
        <PlaygroundLazyLog
          highlight={[1, 1000]}
          extraLines={23}
          foo="FOO"
          bar="BAZ"
          logs={logs} />);
    expect(lazy.text()).toEqual('<t />');
    const div = lazy.find('div');
    expect(div.props().className).toEqual("playground-lazy-log");
    const _lazy = lazy.find(LazyLog);
    expect(_lazy.props().text).toEqual('LOG1\nLOG2\n');
    expect(_lazy.props().highlight).toEqual([1, 1000]);
    expect(_lazy.props().extraLines).toEqual(23);
    expect(_lazy.props().foo).toEqual("FOO");
    expect(_lazy.props().bar).toEqual("BAZ");
});
