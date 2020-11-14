import React from 'react';

import {Stage, Layer} from 'react-konva';

import CloudLogo from '../images/cloud.svg';

import {KonvaImage} from '../shared/image';


class CloudImage extends React.Component {
    state = {};

    render () {
        return (
            <KonvaImage
              {...this.props}
              image={CloudLogo}
              x={this.state.x || this.props.x}
              y={this.state.y || this.props.y}
              draggable
              width={this.props.width || 50}
              height={this.props.width || 50}
              onDragStart={() => {
                  this.setState({
                      isDragging: true
                  });
              }}
              onDragEnd={e => {
                  this.setState({
                      isDragging: false,
                      x: e.target.x(),
                      y: e.target.y()
                  });
              }}
            />);
    };
}


export default class EdgesContent extends React.PureComponent {

    render () {

        return (
	    <div className="canvas">
              <Stage width={600} height={400}>
                <Layer>
                  <CloudImage
                    x={30}
                    y={30}
                    width={300}
                    height={200}
                        />
                </Layer>
              </Stage>
            </div>);
    }
}
