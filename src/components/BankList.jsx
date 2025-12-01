import React, { useState } from 'react';
import Card from './Card';
import { BankIcon } from './Icons';

const BankLogo = ({ url, name }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div style={{ opacity: 0.5 }}>
        <BankIcon />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${name} logo`}
      onError={() => setError(true)}
      style={{
        width: '60px',
        height: '60px',
        objectFit: 'contain',
      }}
    />
  );
};

const BankList = ({ banks, currency }) => {
  if (!banks || banks.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>NO BANK DATA AVAILABLE</div>
      </Card>
    );
  }

  return (
    <>
      {banks.map((bank, index) => (
        <Card
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: bank.is_mock ? '#ffcccc' : 'var(--bg-card)',
            border: bank.is_mock ? '2px dashed red' : '3px solid black',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            padding: '1rem'
          }}
          className="bank-card-inner"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'left', lineHeight: '1.2' }}>
              {bank.name}
              {bank.is_mock && <span style={{ fontSize: '0.6rem', color: 'red', display: 'block' }}>(MOCK DATA)</span>}
            </div>
            <BankLogo url={bank.logo} name={bank.name} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>BUY</div>
              <div style={{ backgroundColor: 'var(--accent-green)', padding: '2px 5px', border: '2px solid black', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {bank.buy.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>SELL</div>
              <div style={{ backgroundColor: 'var(--accent-pink)', padding: '2px 5px', border: '2px solid black', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {bank.sell.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

export default BankList;
