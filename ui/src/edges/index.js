import React from 'react';

import {connect} from 'react-redux';

import {Stage, Layer} from 'react-konva';
import {Group, Text, Tag, Label} from 'react-konva';

import CloudLogo from '../images/cloud.svg';
import EnvoyLogo from '../images/envoy.svg';

import {KonvaImage} from '../shared/image';


class CloudImage extends React.Component {
    state = {};

    render () {
        const {icon, name, proxy, x, y, ...props} = this.props;
        console.log("EDGE ICON", name, proxy);

        return (
            <Group
              x={x}
              y={y}
              width={50}
              height={50}>
              <KonvaImage
                {...props}
                image={icon}
                width={50}
                height={50}
              />
              <Label x={-10} y={30}>
                <Tag
                  pointerWidth={10}
                  stroke="#ccc"
                  fill="#f3f296"
                  opacity={0.9} />
                <Text
                  y={50}
                  x={5}
                  text={proxy + ':' + name}
                  fill="#0a0a0a"
                  padding={5}
                  fontSize={12} />
              </Label>
            </Group>);
    };
}


export class BaseEdgesContent extends React.PureComponent {

    get icons () {
        const {dispatch, proxies, ui} = this.props;
        const {edges={}} = ui;
        return (
            <>
              {Object.entries(edges).map(([k, v], i) => {
                  const icon = EnvoyLogo;
                  return (
                      <CloudImage
                        icon={icon}
                        dispatch={dispatch}
                        resources={edges}
			proxies={proxies}
                        key={i}
                        name={k}
                        {...v}
                      />);
              })}
            </>);

    }

    render () {
        return (
            <div className="canvas">
              <Stage width={600} height={400}>
                <Layer>
                  <KonvaImage
                    image={CloudLogo}
                    x={30}
                    y={30}
                    width={550}
                    height={350}
                    opacity={0.2}
                  />
                  {this.icons}
                </Layer>
              </Stage>
            </div>);
    }
}


const mapStateToProps = function(state) {
    return {
        ui: state.ui.value,
        proxies: state.proxy.value,
    };
}

const EdgesContent = connect(mapStateToProps)(BaseEdgesContent);

export default EdgesContent;
