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
import GoldInvestmentBanks from './components/GoldInvestmentBanks';
import SilverHistoryChart from './components/SilverHistoryChart';
import BitcoinHistoryChart from './components/BitcoinHistoryChart';
import Footer from './components/Footer';
import BankReliability from './components/BankReliability';
import BankProfileModal from './components/BankProfileModal';
import { refreshRates, fetchInitialData } from './utils/fetchUtils';
import { shareToTelegram, exportHistoryToCSV } from './utils/shareExport';
import InteractiveReport from './components/InteractiveReport';

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
  const [savingsCurrency, setSavingsCurrency] = useState('UZS'); // 'UZS' or 'USD' for savings view
  const [selectedBank, setSelectedBank] = useState(null); // For bank profile modal
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

  // Listen for navigate-to-savings event from BankProfileModal
  useEffect(() => {
    const handleNavigateToSavings = () => {
      setViewMode('savings');
    };
    window.addEventListener('navigate-to-savings', handleNavigateToSavings);
    return () => window.removeEventListener('navigate-to-savings', handleNavigateToSavings);
  }, []);

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
      const jsonData = await fetchInitialData();
      if (!jsonData) {
        throw new Error('Failed to fetch data');
      }
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
      // Determine scope based on viewMode
      let scope = 'exchange';
      if (viewMode === 'news') scope = 'news';
      if (viewMode === 'savings') scope = 'savings';
      if (viewMode === 'metals') scope = 'metals';
      if (viewMode === 'reliability') scope = 'reliability';

      const freshData = await refreshRates(scope);

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
  const savingsUsdData = data ? data.savings_usd : null;
  const newsData = data ? data.news : null;
  const goldBarsData = data ? data.gold_bars : null;
  const goldHistoryData = data ? data.gold_history : null;
  const silverHistoryData = data ? data.silver_history : null;
  const bitcoinHistoryData = data ? data.bitcoin_history : null;
  const reliabilityData = data ? data.bank_reliability : null;

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
  const topSavingsUsdRate = savingsUsdData && savingsUsdData.data ? Math.max(...savingsUsdData.data.map(s => s.rate)) : 0;
  const currentTopSavingsRate = savingsCurrency === 'USD' ? topSavingsUsdRate : topSavingsRate;

  return (
    <div className="dashboard-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', position: 'relative', paddingBottom: '3rem' }}>
      <div className="brutal-grid"></div>

      {!isOnline && <OfflineBanner />}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gridColumn: '1 / -1', gap: '2rem' }}>
          <h1
            className="loading-text"
            style={{
              fontSize: '3rem',
              border: '3px solid var(--text-color)',
              padding: '20px 40px',
              boxShadow: '8px 8px 0 var(--text-color)',
              background: 'var(--card-bg)',
              position: 'relative'
            }}
          >
            <span className="loading-glitch" data-text="NEOUZS">NEOUZS</span>
          </h1>
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
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
              topSavingsRate={currentTopSavingsRate}
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
              // ... (metals sidebar)
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
              // ... (news sidebar)
              <>
                <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                  <h3 style={{ marginTop: 0 }}>NEWS SOURCES</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Click a source to filter:</p>
                  <ul style={{ paddingLeft: '0', marginTop: '0.5rem', lineHeight: '2', listStyle: 'none' }}>
                    {[
                      { name: 'Gazeta.uz', key: 'Gazeta.uz' },
                      { name: 'UzDaily', key: 'UzDaily' },
                      { name: 'Spot.uz', key: 'Spot.uz' },
                      { name: 'Central Bank (CBU)', key: 'CBU' },
                      { name: 'IMF', key: 'IMF' },
                      { name: 'World Bank', key: 'World Bank' },
                      { name: 'WorldNews', key: 'WorldNews' }
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
            ) : viewMode === 'report' ? (
              // Report Mode Sidebar Content
              <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                <h3 style={{ marginTop: 0 }}>SECTOR MONITOR</h3>
                <p>Comprehensive analysis of the Uzbekistan banking sector.</p>
                <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  <li>Market Structure</li>
                  <li>Bank Directory</li>
                  <li>Activity Rankings</li>
                </ul>
              </div>
            ) : viewMode === 'reliability' ? (
              // Reliability Mode Sidebar Content
              <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                <h3 style={{ marginTop: 0 }}>TRUST SCORE</h3>
                <p>Scores are based on official CBU & CERR data.</p>
                <p>Check "A" grade banks for highest stability.</p>
              </div>
            ) : (
              // Savings Mode Sidebar Content
              <div className="brutal-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                <h3 style={{ marginTop: 0 }}>SAVINGS TIPS</h3>
                <p>Banks offer up to <strong>{currentTopSavingsRate}%</strong> on {savingsCurrency} deposits.</p>
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
                    onBankClick={(bank) => setSelectedBank(bank)}
                  />
                </div>

                <button
                  className="brutal-btn"
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem', backgroundColor: showAll ? 'var(--accent-cyan)' : 'var(--card-bg)', color: showAll ? '#000000' : 'var(--text-color)' }}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'SHOW FEATURED ONLY' : 'SHOW ALL BANKS'}
                </button>

                {/* Quick Actions: Share & Export */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {/* Telegram Share Button */}
                  <button
                    className="brutal-btn share-telegram-btn"
                    onClick={() => shareToTelegram(currency, currentData.cbu, bestBuyRate, bestSellRate, data.last_updated)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #229ED9 0%, #0088CC 100%)',
                      color: '#FFFFFF',
                      border: '3px solid var(--border-color)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                    title="Share current rates to Telegram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    SHARE
                  </button>

                  {/* CSV Export Button */}
                  <button
                    className="brutal-btn export-csv-btn"
                    onClick={() => exportHistoryToCSV(currentData.history, currency)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      border: '3px solid var(--border-color)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                    title="Download 30-day history as CSV"
                  >
                    <span style={{ fontSize: '1.1rem' }}>📊</span>
                    EXPORT CSV
                  </button>
                </div>
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

                {metalType === 'gold' && (
                  <GoldInvestmentBanks />
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
            ) : viewMode === 'reliability' ? (
              <BankReliability reliabilityData={reliabilityData} setViewMode={setViewMode} />
            ) : viewMode === 'report' ? (
              <InteractiveReport darkMode={darkMode} />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>SAVINGS</h2>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Currency Toggle */}
                    <div style={{ display: 'flex', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                      <button
                        onClick={() => setSavingsCurrency('UZS')}
                        style={{
                          border: 'none',
                          background: savingsCurrency === 'UZS' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                          color: savingsCurrency === 'UZS' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                          padding: '0.4rem 0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '0.85rem'
                        }}
                      >
                        UZS
                      </button>
                      <button
                        onClick={() => setSavingsCurrency('USD')}
                        style={{
                          border: 'none',
                          background: savingsCurrency === 'USD' ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
                          color: savingsCurrency === 'USD' ? (darkMode ? '#FFFFFF' : 'var(--bg-color)') : 'var(--text-color)',
                          padding: '0.4rem 0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          borderLeft: '3px solid var(--border-color)',
                          fontSize: '0.85rem'
                        }}
                      >
                        USD
                      </button>
                    </div>

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
                </div>

                <div className="bank-grid" style={{ marginBottom: '3rem' }}>
                  <SavingsList
                    savings={savingsCurrency === 'USD'
                      ? (savingsUsdData ? savingsUsdData.data : [])
                      : (savingsData ? savingsData.data : [])}
                    sortType={sortType}
                    currency={savingsCurrency}
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

      {/* Bank Profile Modal */}
      {selectedBank && (
        <BankProfileModal
          bankName={selectedBank.name}
          bankData={selectedBank}
          onClose={() => setSelectedBank(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;
