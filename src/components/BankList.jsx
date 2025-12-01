import React, { useState } from 'react';
import Card from './Card';
import { BankIcon } from './Icons';

const BankLogo = ({ url, name }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        opacity: 0.5
      }}>
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
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '40px',
        height: '40px',
        objectFit: 'contain',
        // Neubrutalism style: simple
      }}
    />
  );
};

const BankList = ({ banks }) => {
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
            gap: '1.5rem',
            textAlign: 'center',
            height: '100%',
            position: 'relative' // Needed for absolute positioning of logo
          }}
          className="bank-card-inner"
        >
          <BankLogo url={bank.logo} name={bank.name} />

          <div style={{ fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem' }}>
            {bank.name}
            {bank.is_mock && <span style={{ fontSize: '0.6rem', color: 'red', display: 'block' }}>(MOCK DATA)</span>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>BUY</div>
              <div style={{ backgroundColor: 'var(--accent-green)', padding: '2px 5px', border: '2px solid black', fontSize: '1.1rem' }}>
                {bank.buy.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>SELL</div>
              <div style={{ backgroundColor: 'var(--accent-pink)', padding: '2px 5px', border: '2px solid black', fontSize: '1.1rem' }}>
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
