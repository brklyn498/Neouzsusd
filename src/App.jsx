import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BankList from './components/BankList';
import Calculator from './components/Calculator';
import HistoryChart from './components/HistoryChart';
import { refreshRates } from './utils/fetchUtils';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('best_buy');
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

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
        // Update only the CBU rate and timestamp
        setData(prevData => ({
          ...prevData,
          cbu: freshData.cbu,
          last_updated: freshData.timestamp
        }));
        setLastRefresh(freshData.timestamp);
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

  const getProcessedBanks = () => {
    if (!data || !data.banks) return [];

    // 1. Filter
    let processed = data.banks;
    if (!showAll) {
      // Show only featured if showAll is false
      // Fallback: if no featured flag, show top 5
      const hasFeatured = processed.some(b => b.featured);
      if (hasFeatured) {
        processed = processed.filter(b => b.featured);
      } else {
        processed = processed.slice(0, 5);
      }
    }

    // 2. Sort
    return [...processed].sort((a, b) => {
      switch (sortType) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'spread':
          // Spread = Sell - Buy (Lower is tighter/better usually, but here we just sort by magnitude)
          return (a.sell - a.buy) - (b.sell - b.buy);
        case 'highest_buy': // Highest Buy Rate
          return b.buy - a.buy;
        case 'highest_sell': // Highest Sell Rate
          return b.sell - a.sell;
        case 'best_sell': // Lowest Sell Rate (Best for user buying USD)
          return a.sell - b.sell;
        case 'best_buy': // Highest Buy Rate (Best for user selling USD) - Same as highest_buy
        default:
          return b.buy - a.buy;
      }
    });
  };

  const bestBuyRate = data && data.banks ? Math.max(...data.banks.map(b => b.buy)) : 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', position: 'relative', paddingBottom: '3rem' }}>
      <div className="brutal-grid"></div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h1 style={{ fontSize: '3rem', border: '3px solid black', padding: '20px', boxShadow: '8px 8px 0 black', background: 'white' }}>
            LOADING...
          </h1>
        </div>
      )}

      {error && (
        <div style={{ border: '3px solid black', padding: '20px', background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold' }}>
          ERROR: {error}
          <br />
          <button onClick={fetchData} className="brutal-btn" style={{ marginTop: '10px' }}>RETRY</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <Header
            cbuRate={data.cbu}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            lastRefresh={lastRefresh}
          />

          <HistoryChart history={data.history} />

          <Calculator bestBuy={bestBuyRate} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>BANKS</h2>

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

          <BankList banks={getProcessedBanks()} />

          <button
            className="brutal-btn"
            style={{ width: '100%', marginTop: '1rem', padding: '1rem', backgroundColor: showAll ? 'var(--accent-cyan)' : 'white' }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'SHOW FEATURED ONLY' : 'SHOW ALL BANKS'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
            LAST UPDATED: {data.last_updated}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
