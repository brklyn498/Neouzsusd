import React from 'react';
import Card from './Card';

const Header = ({ cbuRate }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
        UZS / USD
      </h1>
      <Card style={{ backgroundColor: 'var(--accent-yellow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>CBU RATE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
            {cbuRate ? cbuRate.toLocaleString() : 'LOADING...'}
            </div>
        </div>
        <div style={{ fontSize: '3rem'}}>🏦</div>
      </Card>
    </div>
  );
};

export default Header;
