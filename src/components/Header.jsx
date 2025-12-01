import React from 'react';
import Card from './Card';

const Header = ({ cbuRate, onRefresh, refreshing, lastRefresh }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '3rem', margin: '0', textTransform: 'uppercase' }}>
          UZS / USD
        </h1>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="brutal-btn brutal-refresh-btn"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: refreshing ? 'wait' : 'pointer',
            opacity: refreshing ? 0.7 : 1
          }}
        >
          {refreshing ? '⏳ REFRESHING...' : '🔄 REFRESH'}
        </button>
      </div>
      <Card style={{ backgroundColor: 'var(--accent-yellow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>CBU RATE</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
            {cbuRate ? cbuRate.toLocaleString() : 'LOADING...'}
          </div>
          {lastRefresh && (
            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.3rem' }}>
              Last refreshed: {lastRefresh}
            </div>
          )}
        </div>
        <div style={{ fontSize: '3rem' }}>🏦</div>
      </Card>
    </div>
  );
};

export default Header;
