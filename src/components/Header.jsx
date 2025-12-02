import React from 'react';
import Card from './Card';
import WeatherBadge from './WeatherBadge';

const Header = ({ cbuRate, onRefresh, refreshing, lastRefresh, currency, setCurrency, darkMode, toggleDarkMode, weather }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0', textTransform: 'uppercase', color: darkMode ? 'var(--accent-brand)' : 'var(--text-color)' }}>
            UZS / {currency}
          </h1>
          <WeatherBadge weather={weather} />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="brutal-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
            }}
          >
            {darkMode ? '☀️' : '🌑'}
          </button>

          {/* Currency Toggle */}
          <div style={{ display: 'flex', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                border: 'none',
                background: currency === 'USD' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: currency === 'USD' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
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
                background: currency === 'RUB' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: currency === 'RUB' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderLeft: '3px solid var(--border-color)'
              }}
            >
              RUB
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              style={{
                border: 'none',
                background: currency === 'EUR' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: currency === 'EUR' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderLeft: '3px solid var(--border-color)'
              }}
            >
              EUR
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
      <Card style={{ backgroundColor: darkMode ? 'var(--header-card-bg, var(--accent-brand))' : 'var(--accent-yellow)', color: darkMode ? '#FFFFFF' : 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
