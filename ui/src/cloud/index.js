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


class ResourceImage extends React.PureComponent {
    static propTypes = {
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        icon: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onMove: PropTypes.func.isRequired,
    };

    render () {
        const {
            x, y,
            icon, name, onMove, ...props} = this.props;
        return (
            <Group
              x={x}
              y={y}
              draggable
              width={50}
              height={50}
              onDragStart={() => {
                  this.setState({
                      isDragging: true
                  });
              }}
              onDragEnd={async e => {
                  await onMove(name, [e.target.x(), e.target.y()]);
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


export class CloudConnections extends React.PureComponent {
    static propTypes = exact({
        connections: PropTypes.array.isRequired,
    });

    render () {
        const {connections} = this.props;
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
            </>
        );
    }
}


export class CloudEmpty extends React.PureComponent {

    render () {
        return (
            <Group x={100} y={100} align="center">
              <Label>
                <Tag
                  pointerWidth={10}
                  stroke="#ccc"
                  fill="#f3f296"
                  opacity={0.9} />
                <Text
                  width={400}
                  align="center"
                  text="The cloud is not a vessel to be filled but a fire to be kindled"
                  fill="#71ac63"
                  padding={15}
                  fontSize={22} />
              </Label>
            </Group>
        );
    }
}


export class CloudResources extends React.PureComponent {
    static propTypes = exact({
        service_types: PropTypes.object.isRequired,
        resources: PropTypes.object.isRequired,
        onMove: PropTypes.func.isRequired,
    });

    render () {
        const {service_types, resources, onMove} = this.props;
        return (
            <>
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
                        onMove={onMove}
                        key={i}
                        name={k}
                        x={v[0]}
                        y={v[1]}
                      />);
              })}
            </>);
    }
}


export class BaseCloudContent extends React.PureComponent {
    static propTypes = exact({
        dispatch: PropTypes.func.isRequired,
        networks: PropTypes.object.isRequired,
        proxies: PropTypes.object.isRequired,
        services: PropTypes.object.isRequired,
        service_types: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
    });

    onMove = async (name, [x, y]) => {
        const {dispatch, networks, proxies, services} = this.props;
        const resources = {};
        resources[name] = [x, y];
        await dispatch(updateCloud({networks, proxies, services, resources}));
    }

    render () {
        // todo: use parent/sibling size for sizing
        // todo: get rid of fouc when loading not-empty
        const {
            service_types, ui} = this.props;
        const {connections=[], resources={}} = ui;
        const resource_types = [];
        ['network', 'service', 'proxy'].forEach(resource_type => {
            const _resources = Object.fromEntries(Object.entries(resources).filter(([k, v]) => {
                return k.split(':')[0] === resource_type;
            }));
            if (Object.keys(_resources).length > 0) {
                resource_types.push(_resources);
            }
        });
        return (
            <div className="canvas bg-cloud">
              <Stage width={600} height={400}>
                <Layer>
                  <CloudConnections connections={connections} />
                  {(resource_types.length === 0) &&
                   <CloudEmpty />
                  }
                  {resource_types.map((_resources, i) => {
                      return (
                          <CloudResources
		            resources={_resources}
                            onMove={this.onMove}
		            service_types={service_types}
                            key={i}
                          />);
                  })}
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
