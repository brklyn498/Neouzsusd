import React from 'react';

const Card = ({ children, className = '', style = {} }) => {
  return (
    <div className={`brutal-card ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Card;
