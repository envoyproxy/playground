import React from 'react';

import useImage from 'use-image';

import {Image} from 'react-konva';


const KonvaImage = (props) => {
    const [image] = useImage(props.image);
    return <Image {...props} image={image} />;
};


export {KonvaImage};
