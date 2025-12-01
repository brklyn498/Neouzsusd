import React from 'react';
import Card from './Card';

const Header = ({ cbuRate, onRefresh, refreshing, lastRefresh, currency, setCurrency }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0', textTransform: 'uppercase' }}>
          UZS / {currency}
        </h1>

        <div style={{ display: 'flex', gap: '10px' }}>
            {/* Currency Toggle */}
            <div style={{ display: 'flex', border: '3px solid black', boxShadow: '4px 4px 0 black', backgroundColor: 'white' }}>
                <button
                    onClick={() => setCurrency('USD')}
                    style={{
                        border: 'none',
                        background: currency === 'USD' ? 'black' : 'white',
                        color: currency === 'USD' ? 'white' : 'black',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                    }}
                >
                    USD
                </button>
                <button
                    onClick={() => setCurrency('RUB')}
                    style={{
                        border: 'none',
                        background: currency === 'RUB' ? 'black' : 'white',
                        color: currency === 'RUB' ? 'white' : 'black',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderLeft: '3px solid black'
                    }}
                >
                    RUB
                </button>
            </div>

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
            {refreshing ? 'LOADING...' : 'REFRESH'}
            </button>
        </div>
      </div>
      <Card style={{ backgroundColor: 'var(--accent-yellow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>CBU RATE ({currency})</div>
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
