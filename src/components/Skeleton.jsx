import React from 'react';

const Skeleton = ({ width, height, className = '', style = {} }) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: width,
                height: height,
                ...style
            }}
        />
    );
};

export default Skeleton;
