import React, { useState, useMemo } from 'react';
import Card from './Card';

const SavingsCard = ({ savings, isBestRate, className = '' }) => {
  const { bank_name, deposit_name, rate, duration, min_amount, is_online, logo } = savings;

  // Check if this is a USD/foreign currency deposit
  const isUSD = savings.currency && (savings.currency === 'USD' || savings.currency === 'EUR');

  // Parse min_amount to get numeric value (e.g., "1 000 000 UZS" -> 1000000)
  const parseAmount = (str) => {
    if (!str) return isUSD ? 500 : 1000000;
    const numStr = str.replace(/[^\d]/g, '');
    return parseInt(numStr) || (isUSD ? 500 : 1000000);
  };

  // Set min/max based on currency
  const minAmountNum = isUSD ? 500 : parseAmount(min_amount);
  const maxAmount = isUSD ? 100000 : 200000000; // $100K for USD, 200M for UZS
  const sliderStep = isUSD ? 100 : 1000000; // $100 step for USD, 1M for UZS
  const currencySymbol = isUSD ? '$' : '';
  const currencyLabel = isUSD ? 'USD' : 'UZS';

  // State for calculator
  const [depositAmount, setDepositAmount] = useState(minAmountNum);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate interest for 1 year
  const calculateInterest = useMemo(() => {
    const rateNum = parseFloat(rate) || 0;
    const yearlyInterest = (depositAmount * rateNum) / 100;
    const totalAmount = depositAmount + yearlyInterest;
    return {
      interest: yearlyInterest,
      total: totalAmount
    };
  }, [depositAmount, rate]);

  // Format number with spaces (Uzbek format) or commas for USD
  const formatNumber = (num) => {
    if (isUSD) {
      return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Function to determine logo source
  const getLogoSrc = () => {
    if (logo) return logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(bank_name)}&background=random&size=64`;
  };

  // Calculate slider percentage for styling
  const sliderPercentage = ((depositAmount - minAmountNum) / (maxAmount - minAmountNum)) * 100;

  return (
    <Card className={`brutal-card-hover ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {isBestRate && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'var(--accent-brand)',
          color: 'white',
          padding: '5px 10px',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          zIndex: 10,
          borderBottomLeftRadius: '4px',
          borderLeft: '3px solid var(--border-color)',
          borderBottom: '3px solid var(--border-color)'
        }}>
          BEST RATE
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--border-color)',
            flexShrink: 0,
            background: 'white'
          }}>
            <img
              src={getLogoSrc()}
              alt={bank_name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bank_name)}&background=random&size=64`; }}
            />
          </div>
          <div style={{ maxWidth: '200px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {bank_name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              opacity: 0.8,
              fontWeight: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {deposit_name}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7 }}>INTEREST RATE</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--rate-color, var(--accent-brand))' }}>
            {rate}%
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {/* Currency badge for USD/EUR deposits */}
            {savings.currency && savings.currency !== 'UZS' && (
              <span className="brutal-pill" style={{
                backgroundColor: savings.currency === 'EUR' ? '#003399' : '#006400',
                color: 'white',
              }}>
                {savings.currency}
              </span>
            )}
            {is_online ? (
              <span className="brutal-pill" style={{
                backgroundColor: 'var(--badge-online-bg)',
                color: 'var(--badge-online-text)',
              }}>
                ONLINE
              </span>
            ) : (
              <span className="brutal-pill" style={{
                backgroundColor: 'var(--badge-banks-bg)',
                color: 'var(--badge-banks-text)',
              }}>
                BANKS ONLY
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ opacity: 0.7 }}>Duration: </span> <strong>{duration}</strong>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ opacity: 0.7 }}>Min: </span> <strong>{min_amount}</strong>
          </div>
        </div>
      </div>

      {/* Calculator Toggle Button */}
      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className={`savings-calc-toggle ${showCalculator ? 'active' : ''}`}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.5rem',
          border: '2px solid var(--border-color)',
          background: showCalculator ? 'var(--accent-cyan)' : 'var(--bg-color)',
          color: showCalculator ? '#FFFFFF' : 'var(--text-color)',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          transition: 'all 0.15s ease'
        }}
      >
        {showCalculator ? '▲ HIDE CALCULATOR' : '▼ CALCULATE EARNINGS'}
      </button>

      {/* Embedded Calculator */}
      {showCalculator && (
        <div className="savings-calculator" style={{
          marginTop: '0.75rem',
          padding: '1rem',
          background: 'var(--bg-color)',
          border: '2px solid var(--border-color)',
          animation: 'slideDownCalc 0.2s ease-out'
        }}>
          {/* Amount Label */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.8rem'
          }}>
            <span style={{ opacity: 0.7 }}>DEPOSIT AMOUNT (1 YEAR)</span>
            <span className="savings-deposit-amount" style={{ fontWeight: 'bold' }}>
              {currencySymbol}{formatNumber(depositAmount)} {currencyLabel}
            </span>
          </div>

          {/* Slider */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="range"
              min={minAmountNum}
              max={maxAmount}
              step={sliderStep}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="savings-slider"
              style={{
                width: '100%',
                height: '8px',
                appearance: 'none',
                background: `linear-gradient(to right, var(--accent-brand) ${sliderPercentage}%, var(--border-color) ${sliderPercentage}%)`,
                border: '2px solid var(--border-color)',
                cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              opacity: 0.6,
              marginTop: '0.25rem'
            }}>
              <span>{currencySymbol}{formatNumber(minAmountNum)}</span>
              <span>{isUSD ? '$100K' : '200M'}</span>
            </div>
          </div>

          {/* Results */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem'
          }}>
            <div style={{
              padding: '0.5rem',
              background: 'var(--card-bg)',
              border: '2px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>
                Interest (1 Year)
              </div>
              <div className="savings-interest-value" style={{
                fontSize: '1.1rem',
                fontWeight: '900',
                color: '#00C853' // Bright pronounced green
              }}>
                +{currencySymbol}{formatNumber(calculateInterest.interest)}
              </div>
            </div>
            <div style={{
              padding: '0.5rem',
              background: 'var(--accent-brand)',
              border: '2px solid var(--border-color)',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase' }}>
                Total After 1 Year
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '900'
              }}>
                {currencySymbol}{formatNumber(calculateInterest.total)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SavingsCard;
