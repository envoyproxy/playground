import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Stage, Layer, Line} from 'react-konva';

import CloudLogo from '../images/cloud.svg';
import EnvoyLogo from '../images/envoy.svg';

import {KonvaImage} from '../shared/image';

import {updateUI} from '../app/store';


class ResourceImage extends React.Component {
    state = {};

    render () {
        const {
            x: startX, y: startY,
            resources: _resources,
            icon, name, dispatch, ...props} = this.props;
        const {x, y} = this.state;
        return (
            <KonvaImage
              {...props}
              image={icon}
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
              onDragEnd={e => {
                  // console.log("UPDATE STATE", name, dispatch);
                  const resources = {..._resources};
                  resources[name] = [e.target.x(), e.target.y()];
                  dispatch(updateUI({resources}));
              }}
            />);
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

    getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    getX = (resource) => {
        if (resource === 'cloud') {
            return this.getRndInteger(200, 400);
        } else {
            const beforeOrAfter = this.getRndInteger(0, 1);
            if (beforeOrAfter === 0) {
                return this.getRndInteger(this.xyIcons[1], 200);
            } else {
                return this.getRndInteger(400, this.xy[0] - this.xyIcons[0]);
            }
        }
    };

    get xy () {
        return [600, 400];
    }

    get xyIcons () {
        return [50, 50];
    }

    getY = (resource) => {
        if (resource === 'cloud') {
            return this.getRndInteger(100, 300);
        } else {
            const beforeOrAfter = this.getRndInteger(0, 1);
            if (beforeOrAfter === 0) {
                return this.getRndInteger(this.xyIcons[1], 100);
            } else {
                return this.getRndInteger(300, this.xy[1] - this.xyIcons[1]);
            }
        }
    };

    get icons () {
        // THIS IS CAUSING A MEM LEAK - MOVE TO willUpdateProps or somesuch
        const {dispatch, networks, proxies, services, service_types, ui} = this.props;
        const {resources: _resources={}} = ui;
        const resources = {..._resources};
        let changed = false;
        // remove missing items
        for (const k of Object.keys(resources)) {
            const resourceType = k.split(':')[0];
            const resourceName = k.split(':').pop();
            const _check = {network: networks, service: services, proxy: proxies};
            for (const [_k, _v] of Object.entries(_check)) {
                if (resourceType === _k && !_v[resourceName]) {
                    delete resources[k];
                    changed = true;
                }
            }
        }
        // add new items
        for (const k of Object.keys(networks)) {
            if (!resources['network:' + k]) {
                resources['network:' + k] = [this.getX('cloud'), this.getY('cloud')];
                changed = true;
            }
        }
        for (const [k, v] of Object.entries(services)) {
            if (!resources['service:' + v.service_type + ':' + k]) {
                resources['service:' + v.service_type + ':' + k] = [this.getX(), this.getY()];
                changed = true;
            }
        }
        for (const k of Object.keys(proxies)) {
            if (!resources['proxy:' + k]) {
                resources['proxy:' + k] = [this.getX(), this.getY()];
                changed = true;
            }
        }
        if (changed) {
            dispatch(updateUI({resources}));
        }
        const connections = [];
        for (const [k, v] of Object.entries(networks)) {
            for (const service of v.services) {
                connections.push([
                    ...resources['network:' + k].map(v => v + 25),
                    ...resources['service:' + services[service].service_type + ':' + service].map(v => v + 25)]);
            }

            for (const proxy of v.proxies) {
                connections.push([
                    ...resources['network:' + k].map(v => v + 25),
                    ...resources['proxy:' + proxy].map(v => v + 25)]);
            }
        }
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
            <div className="canvas">
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
