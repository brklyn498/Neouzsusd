import React, { useState, useEffect } from 'react';
import Card from './Card';

const Calculator = ({ bestBuy, bestSell, currency }) => {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(0);
  const [mode, setMode] = useState('foreign_to_uzs'); // 'foreign_to_uzs' or 'uzs_to_foreign'

  useEffect(() => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val)) {
      setResult(0);
      return;
    }

    if (mode === 'foreign_to_uzs') {
       // Converting USD to UZS (Selling USD to bank) -> Use Buy Rate (Highest Buy)
       if (bestBuy) {
         setResult(val * bestBuy);
       }
    } else {
       // Converting UZS to USD (Buying USD from bank) -> Use Sell Rate (Lowest Sell)
       if (bestSell && bestSell > 0) {
         setResult(val / bestSell);
       } else {
         setResult(0);
       }
    }
  }, [amount, bestBuy, bestSell, mode]);

  // Reset input on currency change
  useEffect(() => {
      setAmount('');
      setResult(0);
  }, [currency]);

  const toggleMode = () => {
      setMode(prev => prev === 'foreign_to_uzs' ? 'uzs_to_foreign' : 'foreign_to_uzs');
      setAmount(''); // Clear input to avoid confusion
  };

  const inputLabel = mode === 'foreign_to_uzs' ? currency : 'UZS';
  const outputLabel = mode === 'foreign_to_uzs' ? 'UZS (APPROX)' : `${currency} (APPROX)`;
  const placeholder = mode === 'foreign_to_uzs' ? '100' : '1000000';

  return (
    <Card style={{ backgroundColor: 'var(--accent-cyan)' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{ marginTop: 0, textTransform: 'uppercase', margin: 0 }}>Calculator</h3>
          <button
            onClick={toggleMode}
            className="brutal-btn"
            style={{
                padding: '5px 10px',
                fontSize: '1.2rem',
                background: 'var(--card-bg)',
                color: 'var(--text-color)'
            }}
            title="Switch Direction"
          >
             {mode === 'foreign_to_uzs' ? '⬇️' : '⬆️'}
          </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{inputLabel}</label>
          <input
            type="number"
            className="brutal-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        <div>
           <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{outputLabel}</div>
           <div style={{ fontSize: '2rem', fontWeight: '900', borderBottom: '3px solid var(--text-color)' }}>
             {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
           </div>
        </div>
      </div>
    </Card>
  );
};

export default Calculator;
