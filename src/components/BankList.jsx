import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import Skeleton from './Skeleton';
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

const BankList = ({ banks, currency, bestBuy, bestSell, cbuRate }) => {
  const prevBanksRef = useRef({});
  const [changedRates, setChangedRates] = useState({});
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (!banks) return;

    const newChangedRates = {};
    banks.forEach((bank) => {
      const bankKey = `${bank.name}-${currency}`;
      const prevBank = prevBanksRef.current[bankKey];

      // Always trigger animation on first load
      if (!prevBank) {
        newChangedRates[`${bankKey}-buy`] = true;
        newChangedRates[`${bankKey}-sell`] = true;
      } else {
        // Only trigger if actually changed
        if (prevBank.buy !== bank.buy) {
          newChangedRates[`${bankKey}-buy`] = true;
        }
        if (prevBank.sell !== bank.sell) {
          newChangedRates[`${bankKey}-sell`] = true;
        }
      }

      prevBanksRef.current[bankKey] = { buy: bank.buy, sell: bank.sell };
    });

    if (Object.keys(newChangedRates).length > 0) {
      setChangedRates(newChangedRates);

      // Clear animations after they complete
      const timer = setTimeout(() => {
        setChangedRates({});
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [banks, currency]);

  if (!banks || banks.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>NO BANK DATA AVAILABLE</div>
      </Card>
    );
  }

  return (
    <>
      {banks.length === 0 ? (
        // Skeleton Loading State
        [1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <Card className="brutal-card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Skeleton width="120px" height="1.5rem" />
                <Skeleton width="60px" height="60px" style={{ borderRadius: '50%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <Skeleton width="40px" height="0.8rem" style={{ marginBottom: '5px' }} />
                  <Skeleton width="100%" height="2rem" />
                </div>
                <div style={{ flex: 1 }}>
                  <Skeleton width="40px" height="0.8rem" style={{ marginBottom: '5px' }} />
                  <Skeleton width="100%" height="2rem" />
                </div>
              </div>
            </Card>
          </div>
        ))
      ) : (
        banks.map((bank, index) => {
          const spread = bank.sell - bank.buy;
          const isBestBuy = bank.buy === bestBuy;
          const isBestSell = bank.sell === bestSell;

          // Calculate differences from CBU rate
          const buyDiff = cbuRate ? bank.buy - cbuRate : 0;
          const sellDiff = cbuRate ? bank.sell - cbuRate : 0;

          // Determine if rates are favorable (buy > CBU is good, sell < CBU is good)
          const buyIsFavorable = buyDiff > 0;
          const sellIsFavorable = sellDiff < 0;

          // Check if rates changed
          const bankKey = `${bank.name}-${currency}`;
          const buyChanged = changedRates[`${bankKey}-buy`];
          const sellChanged = changedRates[`${bankKey}-sell`];

          return (
            <div key={index} className={`animate-slide-in delay-${index % 20}`} style={{ height: '100%' }}>
              <Card
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
                    <div
                      className={buyChanged ? 'rate-changed' : ''}
                      style={{
                        backgroundColor: 'var(--accent-green)',
                        color: 'var(--pill-text-color, #000000)',
                        padding: '2px 5px',
                        border: '2px solid var(--border-color)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                      {bank.buy.toLocaleString()}
                      {cbuRate && Math.abs(buyDiff) > 0 && (
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: 'var(--text-color)'
                        }}>
                          {buyIsFavorable ? '↗' : '↘'}
                        </span>
                      )}
                    </div>
                    {cbuRate && Math.abs(buyDiff) > 0 && (
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: 'var(--text-color)',
                        marginTop: '2px'
                      }}>
                        {buyIsFavorable ? '+' : ''}{buyDiff.toFixed(0)} vs CBU
                      </div>
                    )}
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
                    <div
                      className={sellChanged ? 'rate-changed' : ''}
                      style={{
                        backgroundColor: 'var(--accent-pink)',
                        color: 'var(--pill-text-color, #000000)',
                        padding: '2px 5px',
                        border: '2px solid var(--border-color)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                      {bank.sell.toLocaleString()}
                      {cbuRate && Math.abs(sellDiff) > 0 && (
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: 'var(--text-color)'
                        }}>
                          {sellIsFavorable ? '↘' : '↗'}
                        </span>
                      )}
                    </div>
                    {cbuRate && Math.abs(sellDiff) > 0 && (
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: 'var(--text-color)',
                        marginTop: '2px'
                      }}>
                        {sellIsFavorable ? '' : '+'}{sellDiff.toFixed(0)} vs CBU
                      </div>
                    )}
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
            </div>
          );
        })
      )}
    </>
  );
};

export default BankList;
