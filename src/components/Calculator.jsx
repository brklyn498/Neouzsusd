import React, { useState, useEffect } from 'react';
import Card from './Card';

const Calculator = ({ bestBuy, currency }) => {
  const [amount, setAmount] = useState('');
  const [uzs, setUzs] = useState(0);

  useEffect(() => {
    if (amount && bestBuy) {
      setUzs(parseFloat(amount) * bestBuy);
    } else {
      setUzs(0);
    }
  }, [amount, bestBuy]);

  // Reset input on currency change
  useEffect(() => {
      setAmount('');
      setUzs(0);
  }, [currency]);

  return (
    <Card style={{ backgroundColor: 'var(--accent-cyan)' }}>
      <h3 style={{ marginTop: 0, textTransform: 'uppercase' }}>Calculator</h3>
      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{currency}</label>
          <input
            type="number"
            className="brutal-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
           <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>UZS (APPROX)</div>
           <div style={{ fontSize: '2rem', fontWeight: '900', borderBottom: '3px solid black' }}>
             {uzs.toLocaleString(undefined, { maximumFractionDigits: 0 })}
           </div>
        </div>
      </div>
    </Card>
  );
};

export default Calculator;
