import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BankList from './components/BankList';
import Calculator from './components/Calculator';
import HistoryChart from './components/HistoryChart';
import OfflineBanner from './components/OfflineBanner';
import SavingsList from './components/SavingsList';
import NewsFeed from './components/NewsFeed';
import GoldBarPrices from './components/GoldBarPrices';
import GoldHistoryChart from './components/GoldHistoryChart';
import SilverHistoryChart from './components/SilverHistoryChart';
import BitcoinHistoryChart from './components/BitcoinHistoryChart';
import Footer from './components/Footer';
import { refreshRates } from './utils/fetchUtils';

function App() {
  const [data, setData] = useState(null); // Holds the full nested data
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'RUB'
  const [metalType, setMetalType] = useState('gold'); // 'gold', 'silver' or 'bitcoin'
  const [viewMode, setViewMode] = useState('exchange'); // 'exchange' or 'savings'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('best_buy');
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null); // For news filtering
  const [selectedSource, setSelectedSource] = useState(null); // For news source filtering
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
  const savingsData = data ? data.savings : null;
  const newsData = data ? data.news : null;
  const goldBarsData = data ? data.gold_bars : null;
  const goldHistoryData = data ? data.gold_history : null;
  const silverHistoryData = data ? data.silver_history : null;
  const bitcoinHistoryData = data ? data.bitcoin_history : null;

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

  // Calculate top rate for header
  const topSavingsRate = savingsData && savingsData.data ? Math.max(...savingsData.data.map(s => s.rate)) : 0;

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
              viewMode={viewMode}
              setViewMode={setViewMode}
              topSavingsRate={topSavingsRate}
              metalType={metalType}
            />

            {viewMode === 'exchange' ? (
              <>
                <Calculator bestBuy={bestBuyRate} bestSell={bestSellRate} currency={currency} />
                <div style={{ marginTop: '2rem' }}>
                  <HistoryChart history={currentData.history} currency={currency} />
                </div>
              </>
            ) : viewMode === 'metals' ? (
              // Extras/Metals Mode Sidebar Content
              <>
                {metalType === 'gold' && goldBarsData && (
                  <div>
                    <GoldBarPrices goldBars={goldBarsData} />
                  </div>
                )}
                {metalType === 'silver' && (
                  <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                    <h3 style={{ marginTop: 0 }}>SILVER BARS</h3>
                    <p>Silver bar prices from local banks are not currently tracked.</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Showing International Spot Price (XAG/USD) instead.</p>
                  </div>
                )}
                {metalType === 'bitcoin' && (
                  <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                    <h3 style={{ marginTop: 0 }}>BITCOIN</h3>
                    <p>Real-time data from Polygon.io.</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Showing Spot Price (BTC/USD).</p>
                  </div>
                )}
              </>
            ) : viewMode === 'news' ? (
              // News Mode Sidebar Content
              <>
                <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                  <h3 style={{ marginTop: 0 }}>NEWS SOURCES</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Click a source to filter:</p>
                  <ul style={{ paddingLeft: '0', marginTop: '0.5rem', lineHeight: '2', listStyle: 'none' }}>
                    {[
                      { name: 'Gazeta.uz', key: 'Gazeta.uz' },
                      { name: 'Daryo.uz', key: 'Daryo.uz' },
                      { name: 'UzDaily', key: 'UzDaily' },
                      { name: 'Spot.uz', key: 'Spot.uz' },
                      { name: 'Central Bank (CBU)', key: 'CBU' },
                      { name: 'WorldNews', key: 'uz' }
                    ].map((source) => (
                      <li
                        key={source.key}
                        onClick={() => setSelectedSource(selectedSource === source.key ? null : source.key)}
                        style={{
                          cursor: 'pointer',
                          padding: '0.3rem 0.6rem',
                          marginBottom: '0.25rem',
                          backgroundColor: selectedSource === source.key ? '#00FFFF' : 'transparent',
                          color: selectedSource === source.key ? '#000' : 'var(--text-color)',
                          border: selectedSource === source.key ? '2px solid var(--border-color)' : '2px solid transparent',
                          fontWeight: selectedSource === source.key ? 'bold' : 'normal',
                          transition: 'all 0.15s'
                        }}
                      >
                        • {source.name}
                      </li>
                    ))}
                  </ul>
                  {selectedSource && (
                    <button
                      onClick={() => setSelectedSource(null)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.4rem 0.8rem',
                        background: 'none',
                        border: '2px solid #FF00FF',
                        color: '#FF00FF',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      ✕ CLEAR FILTER
                    </button>
                  )}
                  <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.75rem' }}>Updates every 30 minutes.</p>
                </div>

                {/* Tags Filter Card */}
                <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)', marginTop: '1rem' }}>
                  <h3 style={{ marginTop: 0 }}>FILTER BY CATEGORY</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Economy', 'Banking', 'Markets', 'Business', 'Regulation'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          border: '2px solid var(--border-color)',
                          backgroundColor: selectedTag === tag ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                          color: selectedTag === tag ? '#000' : 'var(--text-color)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          backdropFilter: 'blur(5px)'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTag && (
                    <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', opacity: 0.8 }}>
                      Showing: <strong>{selectedTag}</strong>
                      <button
                        onClick={() => setSelectedTag(null)}
                        style={{
                          marginLeft: '0.5rem',
                          background: 'none',
                          border: 'none',
                          color: '#FF00FF',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕ Clear
                      </button>
                    </p>
                  )}
                </div>
              </>
            ) : (
              // Savings Mode Sidebar Content
              <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                <h3 style={{ marginTop: 0 }}>SAVINGS TIPS</h3>
                <p>Banks offer up to <strong>{topSavingsRate}%</strong> on annual deposits.</p>
                <p>Check "Online" badge for easy opening via apps.</p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem', display: 'none' }} className="mobile-footer">
              LAST UPDATED: {data.last_updated}
            </div>
          </div>

          <div className="dashboard-right">
            {viewMode === 'exchange' ? (
              <>
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
                    cbuRate={currentData.cbu}
                  />
                </div>

                <button
                  className="brutal-btn"
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem', backgroundColor: showAll ? 'var(--accent-cyan)' : 'var(--card-bg)', color: showAll ? '#000000' : 'var(--text-color)' }}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'SHOW FEATURED ONLY' : 'SHOW ALL BANKS'}
                </button>
              </>
            ) : viewMode === 'metals' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>EXTRAS</h2>

                  <div style={{ display: 'flex', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                    <button
                      onClick={() => setMetalType('gold')}
                      style={{
                        border: 'none',
                        background: metalType === 'gold' ? (darkMode ? 'var(--gold-accent)' : 'var(--gold-accent)') : 'var(--card-bg)',
                        color: metalType === 'gold' ? '#000000' : 'var(--text-color)',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      GOLD
                    </button>
                    <button
                      onClick={() => setMetalType('silver')}
                      style={{
                        border: 'none',
                        background: metalType === 'silver' ? (darkMode ? 'var(--silver-accent)' : 'var(--silver-accent)') : 'var(--card-bg)',
                        color: metalType === 'silver' ? '#000000' : 'var(--text-color)',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderLeft: '3px solid var(--border-color)'
                      }}
                    >
                      SILVER
                    </button>
                    <button
                      onClick={() => setMetalType('bitcoin')}
                      style={{
                        border: 'none',
                        background: metalType === 'bitcoin' ? (darkMode ? 'var(--bitcoin-accent)' : 'var(--bitcoin-accent)') : 'var(--card-bg)',
                        color: metalType === 'bitcoin' ? '#000000' : 'var(--text-color)',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderLeft: '3px solid var(--border-color)'
                      }}
                    >
                      BITCOIN
                    </button>
                  </div>
                </div>

                {metalType === 'gold' && goldHistoryData && (
                  <div style={{ marginBottom: '2rem' }}>
                    <GoldHistoryChart goldHistory={goldHistoryData} />
                  </div>
                )}

                {metalType === 'silver' && silverHistoryData && (
                  <div style={{ marginBottom: '2rem' }}>
                    <SilverHistoryChart silverHistory={silverHistoryData} />
                  </div>
                )}

                {metalType === 'bitcoin' && bitcoinHistoryData && (
                  <div style={{ marginBottom: '2rem' }}>
                    <BitcoinHistoryChart bitcoinHistory={bitcoinHistoryData} />
                  </div>
                )}

                <div className="brutal-card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  <p style={{ margin: 0, opacity: 0.7 }}>
                    <strong>DATA SOURCES:</strong> Gold Bar prices from Central Bank of Uzbekistan (via bank.uz).
                    Global Spot Gold, Silver & Bitcoin prices via Massive.com (Polygon.io).
                  </p>
                </div>
              </>
            ) : viewMode === 'news' ? (
              <NewsFeed news={newsData} darkMode={darkMode} selectedTag={selectedTag} selectedSource={selectedSource} />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>SAVINGS</h2>

                  <select
                    className="brutal-btn"
                    style={{ padding: '5px 10px', height: 'auto', outline: 'none' }}
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                  >
                    <option value="rate_desc">HIGHEST RATE</option>
                    <option value="duration_desc">LONGEST DURATION</option>
                    <option value="min_amount_asc">LOWEST DEPOSIT</option>
                  </select>
                </div>

                <div className="bank-grid" style={{ marginBottom: '3rem' }}>
                  <SavingsList
                    savings={savingsData ? savingsData.data : []}
                    sortType={sortType}
                  />
                </div>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.8, fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
              LAST UPDATED: {data.last_updated}
            </div>
          </div>
        </>
      )}

      {!loading && !error && <Footer />}
    </div>
  );
}

export default App;
