import React from 'react';
import Card from './Card';

const BankList = ({ banks }) => {
  if (!banks || banks.length === 0) {
    return (
        <Card>
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>NO BANK DATA AVAILABLE</div>
        </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {banks.map((bank, index) => (
        <Card key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>
            {bank.name}
          </div>
          <div style={{ display: 'flex', gap: '1rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>BUY</div>
              <div style={{ backgroundColor: 'var(--accent-green)', padding: '2px 5px', border: '2px solid black' }}>
                {bank.buy.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>SELL</div>
              <div style={{ backgroundColor: 'var(--accent-pink)', padding: '2px 5px', border: '2px solid black' }}>
                {bank.sell.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BankList;
