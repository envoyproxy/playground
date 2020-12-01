import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Stage, Layer, Line} from 'react-konva';

import CloudLogo from '../app/images/cloud.svg';
import EnvoyLogo from '../app/images/envoy.svg';

import {KonvaImage} from '../shared/image';
import {Group, Text, Tag, Label} from 'react-konva';

import {updateCloud} from '../app/store';


class ResourceImage extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        networks: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        icon: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    };

    state = {};

    render () {
        const {
            x: startX, y: startY,
            networks, proxies, services, store,
            icon, name, dispatch, ...props} = this.props;
        const {x, y} = this.state;
        return (
            <Group
                x={x || startX}
                y={y || startY}
                draggable
                width={50}
                height={50}
                onDragStart={() => {
                    this.setState({
                        isDragging: true
                    });
                }}
                onDragEnd={async e => {
                    const resources = {};
                    resources[name] = [e.target.x(), e.target.y()];
                  await dispatch(updateCloud({networks, proxies, services, resources}));
                }}>
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
                  text={name.split(':').pop()}
                  fill="#0a0a0a"
                  padding={5}
                  fontSize={12} />
              </Label>
            </Group>);
    };
}


export class BaseCloudContent extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
        parentRef: PropTypes.object.isRequired,
    });

    get icons () {
        const {dispatch, networks, proxies, services, service_types, ui} = this.props;
        const {connections=[], resources={}} = ui;
        return (
            <>
              {connections.map((coords, i) => {
                  return (
                      <Line
                        stroke='#aaa'
                        strokeWidth={2}
                        key={i}
                        points={coords} />
                  );
              })}
              {Object.entries(resources).map(([k, v], i) => {
                  const resourceType = k.split(':')[0];
                  let icon;
                  if (resourceType === 'network') {
                      icon = CloudLogo;
                  } else if (resourceType === 'proxy') {
                      icon = EnvoyLogo;
                  } else {
                      const serviceType = k.split(':')[1];
                      icon = service_types[serviceType].icon;
                  }
                  return (
                      <ResourceImage
                        icon={icon}
                        dispatch={dispatch}
                        resources={resources}
			networks={networks}
			services={services}
			proxies={proxies}
                        key={i}
                        name={k}
                        x={v[0]}
                        y={v[1]}
                      />);
              })}
            </>);

    }

    render () {
        // const {parentRef} = this.props;
        return (
            <div className="canvas bg-cloud">
              <Stage width={600} height={400}>
                <Layer>
                  {this.icons}
                </Layer>
              </Stage>
            </div>);
    }
}


const mapStateToProps = function(state) {
    return {
        networks: state.network.value,
        proxies: state.proxy.value,
        services: state.service.value,
        ui: state.ui.value,
        service_types: state.service_type.value,
    };
}

const CloudContent = connect(mapStateToProps)(BaseCloudContent);

export default CloudContent;
