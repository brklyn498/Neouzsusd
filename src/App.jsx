import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BankList from './components/BankList';
import Calculator from './components/Calculator';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('buy'); // 'buy' or 'sell'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/rates.json');
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

  useEffect(() => {
    fetchData();
  }, []);

  const getSortedBanks = () => {
    if (!data || !data.banks) return [];
    return [...data.banks].sort((a, b) => {
      if (sortType === 'buy') {
        return b.buy - a.buy; // Highest buy rate is best for user selling USD
      } else {
        return a.sell - b.sell; // Lowest sell rate is best for user buying USD
      }
    });
  };

  const bestBuyRate = data && data.banks ? Math.max(...data.banks.map(b => b.buy)) : 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', position: 'relative' }}>
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
          <Header cbuRate={data.cbu} />

          <Calculator bestBuy={bestBuyRate} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
            <h2 style={{ margin: 0 }}>BANKS</h2>
            <button
              className="brutal-btn"
              onClick={() => setSortType(sortType === 'buy' ? 'sell' : 'buy')}
            >
              SORT BY: {sortType === 'buy' ? 'BEST BUY' : 'BEST SELL'}
            </button>
          </div>

          <BankList banks={getSortedBanks()} />

          <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
            LAST UPDATED: {data.last_updated}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
