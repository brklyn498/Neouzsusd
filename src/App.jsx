import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BankList from './components/BankList';
import Calculator from './components/Calculator';
import HistoryChart from './components/HistoryChart';
import OfflineBanner from './components/OfflineBanner';
import { refreshRates } from './utils/fetchUtils';

function App() {
  const [data, setData] = useState(null); // Holds the full nested data
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'RUB'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('best_buy');
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('./rates.json');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const freshData = await refreshRates();

      if (freshData) {
        setData(freshData);

        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', '');

        setLastRefresh(timestamp);
      } else {
        throw new Error('Failed to fetch fresh rates');
      }
    } catch (err) {
      console.error('Manual refresh failed:', err);
      alert('Failed to refresh rates. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentData = data ? data[currency.toLowerCase()] : null;
  const weatherData = data ? data.weather : null;

  const getProcessedBanks = () => {
    if (!currentData || !currentData.banks) return [];

    // 1. Filter
    let processed = currentData.banks;
    if (!showAll) {
      // Show only featured if showAll is false
      // Fallback: if no featured flag, show top 5
      const hasFeatured = processed.some(b => b.featured);
      if (hasFeatured) {
        processed = processed.filter(b => b.featured);
      } else {
        processed = processed.slice(0, 6);
      }
    }

    // 2. Sort
    return [...processed].sort((a, b) => {
      switch (sortType) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'spread':
          // Spread = Sell - Buy
          return (a.sell - a.buy) - (b.sell - b.buy);
        case 'highest_buy':
          return b.buy - a.buy;
        case 'highest_sell':
          return b.sell - a.sell;
        case 'best_sell':
          return a.sell - b.sell;
        case 'best_buy':
        default:
          return b.buy - a.buy;
      }
    });
  };

  const bestBuyRate = currentData && currentData.banks ? Math.max(...currentData.banks.map(b => b.buy)) : 0;
  const bestSellRate = currentData && currentData.banks ? Math.min(...currentData.banks.map(b => b.sell)) : 0;

  return (
    <div className="dashboard-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', position: 'relative', paddingBottom: '3rem' }}>
      <div className="brutal-grid"></div>

      {!isOnline && <OfflineBanner />}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gridColumn: '1 / -1' }}>
          <h1 style={{ fontSize: '3rem', border: '3px solid var(--text-color)', padding: '20px', boxShadow: '8px 8px 0 var(--text-color)', background: 'var(--card-bg)' }}>
            LOADING...
          </h1>
        </div>
      )}

      {error && (
        <div style={{ border: '3px solid var(--text-color)', padding: '20px', background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold', gridColumn: '1 / -1' }}>
          ERROR: {error}
          <br />
          <button onClick={fetchData} className="brutal-btn" style={{ marginTop: '10px' }}>RETRY</button>
        </div>
      )}

      {!loading && !error && currentData && (
        <>
          <div className="dashboard-left">
            <Header
              cbuRate={currentData.cbu}
              onRefresh={handleManualRefresh}
              refreshing={refreshing}
              lastRefresh={lastRefresh}
              currency={currency}
              setCurrency={setCurrency}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              weather={weatherData}
            />

            <Calculator bestBuy={bestBuyRate} bestSell={bestSellRate} currency={currency} />

            <div style={{ marginTop: '2rem' }}>
              <HistoryChart history={currentData.history} currency={currency} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem', display: 'none' }} className="mobile-footer">
              LAST UPDATED: {data.last_updated}
            </div>
          </div>

          <div className="dashboard-right">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>MARKET RATES</h2>

              <select
                className="brutal-btn"
                style={{ padding: '5px 10px', height: 'auto', outline: 'none' }}
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="best_buy">BEST BUY (Highest)</option>
                <option value="best_sell">BEST SELL (Lowest)</option>
                <option value="highest_sell">HIGHEST SELL</option>
                <option value="alphabetical">ALPHABETICAL</option>
                <option value="spread">SPREAD (Low to High)</option>
              </select>
            </div>

            <div className="bank-grid">
              <BankList
                banks={getProcessedBanks()}
                currency={currency}
                bestBuy={bestBuyRate}
                bestSell={bestSellRate}
              />
            </div>

            <button
              className="brutal-btn"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', backgroundColor: showAll ? 'var(--accent-cyan)' : 'var(--card-bg)', color: showAll ? '#000000' : 'var(--text-color)' }}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'SHOW FEATURED ONLY' : 'SHOW ALL BANKS'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
              LAST UPDATED: {data.last_updated}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
