import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Stage, Layer} from 'react-konva';
import {Group, Text, Tag, Label} from 'react-konva';

import CloudLogo from '../images/cloud.svg';
import EnvoyLogo from '../images/envoy.svg';

import {KonvaImage} from '../shared/image';


class EdgeImage extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        icon: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        proxies: PropTypes.object.isRequired,
    };

    state = {};

    render () {
        const {icon, name, proxy, x, y, ...props} = this.props;
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
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        proxies: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
    });

    get icons () {
        const {dispatch, proxies, ui} = this.props;
        const {edges={}} = ui;
        return (
            <>
              {Object.entries(edges).map(([k, v], i) => {
                  const icon = EnvoyLogo;
                  return (
                      <EdgeImage
                        icon={icon}
                        dispatch={dispatch}
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
