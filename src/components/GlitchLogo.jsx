import React from 'react';

const GlitchLogo = ({ text = "NEOUZS", className = "", style = {} }) => {
    return (
        <div className={`glitch-wrapper ${className}`} style={style}>
            <span className="glitch-text" data-text={text}>
                {text}
            </span>
        </div>
    );
};

export default GlitchLogo;
