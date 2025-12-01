import React from 'react';

const OfflineBanner = () => {
  return (
    <div style={{
      backgroundColor: 'var(--accent-orange)',
      color: '#000000',
      border: '3px solid #000000',
      boxShadow: '4px 4px 0px 0px #000000',
      padding: '1rem',
      marginBottom: '1rem',
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase'
    }}>
      ⚠ OFFLINE - DATA MAY BE OLD
    </div>
  );
};

export default OfflineBanner;
