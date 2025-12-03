import React, { useState, useEffect } from 'react';
import Card from './Card';
import WeatherBadge from './WeatherBadge';

const Header = ({ cbuRate, onRefresh, refreshing, lastRefresh, currency, setCurrency, darkMode, toggleDarkMode, weather, viewMode, setViewMode, topSavingsRate, metalType }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to GMT+5 (Uzbekistan time)
      const uzbekTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
      const hours = uzbekTime.getHours().toString().padStart(2, '0');
      const minutes = uzbekTime.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0', textTransform: 'uppercase', color: darkMode ? 'var(--accent-brand)' : 'var(--text-color)' }}>
            NEOUZS
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              className="brutal-border brutal-shadow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: 'var(--card-bg)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                minWidth: '100px',
                justifyContent: 'center'
              }}
            >
              {currentTime}
            </div>
            <WeatherBadge weather={weather} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <button
              onClick={() => setViewMode('exchange')}
              style={{
                border: 'none',
                background: viewMode === 'exchange' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: viewMode === 'exchange' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              RATES
            </button>
            <button
              onClick={() => setViewMode('metals')}
              style={{
                border: 'none',
                background: viewMode === 'metals' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: viewMode === 'metals' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderLeft: '3px solid var(--border-color)'
              }}
            >
              EXTRAS
            </button>
            <button
              onClick={() => setViewMode('savings')}
              style={{
                border: 'none',
                background: viewMode === 'savings' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                color: viewMode === 'savings' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                padding: '0.5rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderLeft: '3px solid var(--border-color)'
              }}
            >
              SAVINGS
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="brutal-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Currency Toggle */}
          {viewMode === 'exchange' && (
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
              <button
                onClick={() => setCurrency('KZT')}
                style={{
                  border: 'none',
                  background: currency === 'KZT' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                  color: currency === 'KZT' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                  padding: '0.5rem 1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderLeft: '3px solid var(--border-color)'
                }}
              >
                KZT
              </button>
            </div>
          )}

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
      {viewMode === 'exchange' && (
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
      )}
      {viewMode === 'metals' && (
        <Card style={{ backgroundColor: darkMode ? 'var(--header-card-bg, var(--accent-brand))' : (metalType === 'bitcoin' ? 'var(--bitcoin-accent)' : (metalType === 'silver' ? 'var(--silver-accent)' : 'var(--gold-accent)')), color: darkMode ? '#FFFFFF' : 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {metalType === 'bitcoin' ? 'BITCOIN PRICE (BTC/USD)' : (metalType === 'silver' ? 'SILVER PRICE (XAG/USD)' : 'GOLD PRICE (XAU/USD)')}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
              LIVE DATA
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
              REAL-TIME MARKET DATA
            </div>
          </div>
          <div style={{ fontSize: '3rem' }}>{metalType === 'bitcoin' ? '₿' : (metalType === 'silver' ? '🥈' : '🪙')}</div>
        </Card>
      )}
      {viewMode === 'savings' && (
        <Card style={{ backgroundColor: darkMode ? 'var(--header-card-bg, var(--accent-brand))' : 'var(--accent-green)', color: darkMode ? '#FFFFFF' : 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>TOP SAVINGS RATE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>
              {topSavingsRate ? `${topSavingsRate}%` : 'LOADING...'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
              FIND THE BEST DEPOSIT
            </div>
          </div>
          <div style={{ fontSize: '3rem' }}>💰</div>
        </Card>
      )}
    </div>
  );
};

export default Header;
