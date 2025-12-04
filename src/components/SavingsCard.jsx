import React from 'react';
import Card from './Card';

const SavingsCard = ({ savings, isBestRate, className = '' }) => {
  const { bank_name, deposit_name, rate, duration, min_amount, is_online, logo } = savings;

  // Function to determine logo source
  const getLogoSrc = () => {
    if (logo) return logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(bank_name)}&background=random&size=64`;
  };

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
          {is_online ? (
            <span className="brutal-pill" style={{
              backgroundColor: 'var(--badge-online-bg)',
              color: 'var(--badge-online-text)',
              alignSelf: 'flex-end',
              marginBottom: '5px'
            }}>
              ONLINE
            </span>
          ) : (
            <span className="brutal-pill" style={{
              backgroundColor: 'var(--badge-banks-bg)',
              color: 'var(--badge-banks-text)',
              alignSelf: 'flex-end',
              marginBottom: '5px'
            }}>
              BANKS ONLY
            </span>
          )}
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ opacity: 0.7 }}>Duration: </span> <strong>{duration}</strong>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ opacity: 0.7 }}>Min: </span> <strong>{min_amount}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SavingsCard;
