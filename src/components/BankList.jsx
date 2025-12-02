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

const BankList = ({ banks, currency, bestBuy, bestSell }) => {
  if (!banks || banks.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>NO BANK DATA AVAILABLE</div>
      </Card>
    );
  }

  return (
    <>
      {banks.map((bank, index) => {
        const spread = bank.sell - bank.buy;
        const isBestBuy = bank.buy === bestBuy;
        const isBestSell = bank.sell === bestSell;

        return (
          <Card
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: bank.is_mock ? 'var(--accent-orange)' : 'var(--card-bg)',
              border: bank.is_mock ? '2px dashed var(--accent-orange)' : '3px solid var(--border-color)',
              flexDirection: 'column',
              gap: '1rem',
              height: '100%',
              padding: '1rem',
              position: 'relative', // For badge positioning if needed
              // opacity: bank.is_mock ? 0.8 : 1
            }}
            className="bank-card-inner"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'left', lineHeight: '1.2' }}>
                {bank.name}
                {bank.is_mock && <span style={{ fontSize: '0.6rem', color: 'var(--accent-orange)', display: 'block' }}>(MOCK DATA)</span>}
              </div>
              <BankLogo url={bank.logo} name={bank.name} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>BUY</div>
                <div style={{ backgroundColor: 'var(--accent-green)', color: 'var(--pill-text-color, #000000)', padding: '2px 5px', border: '2px solid var(--border-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {bank.buy.toLocaleString()}
                </div>
                {isBestBuy && (
                  <div style={{
                    marginTop: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--text-color)',
                    color: 'var(--card-bg)',
                    padding: '2px 4px'
                  }}>
                    BEST BUY
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>SELL</div>
                <div style={{ backgroundColor: 'var(--accent-pink)', color: 'var(--pill-text-color, #000000)', padding: '2px 5px', border: '2px solid var(--border-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {bank.sell.toLocaleString()}
                </div>
                {isBestSell && (
                  <div style={{
                    marginTop: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--text-color)',
                    color: 'var(--card-bg)',
                    padding: '2px 4px'
                  }}>
                    BEST SELL
                  </div>
                )}
              </div>
            </div>

            <div style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '0.8rem',
              opacity: 0.7,
              marginTop: '-0.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.5rem'
            }}>
              SPREAD: <span style={{ fontWeight: 'bold' }}>{spread.toLocaleString()}</span> UZS
            </div>
          </Card>
        );
      })}
    </>
  );
};

export default BankList;
