import React, { useState, useEffect } from 'react';
import Card from './Card';

const Calculator = ({ bestBuy }) => {
  const [usd, setUsd] = useState('');
  const [uzs, setUzs] = useState(0);

  useEffect(() => {
    if (usd && bestBuy) {
      setUzs(parseFloat(usd) * bestBuy);
    } else {
      setUzs(0);
    }
  }, [usd, bestBuy]);

  return (
    <Card style={{ backgroundColor: 'var(--accent-cyan)' }}>
      <h3 style={{ marginTop: 0, textTransform: 'uppercase' }}>Calculator</h3>
      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>USD</label>
          <input
            type="number"
            className="brutal-input"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
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
