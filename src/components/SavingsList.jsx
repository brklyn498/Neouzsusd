import React from 'react';
import SavingsCard from './SavingsCard';

const SavingsList = ({ savings, sortType }) => {
  if (!savings || savings.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        border: '3px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)'
      }}>
        NO SAVINGS OFFERS AVAILABLE
      </div>
    );
  }

  // Sorting Logic
  const sortedSavings = [...savings].sort((a, b) => {
    switch (sortType) {
      case 'rate_desc':
        return b.rate - a.rate;
      case 'min_amount_asc':
        // Try to parse min amount roughly
        const parseAmount = (str) => parseInt(str.replace(/\D/g, '')) || 0;
        return parseAmount(a.min_amount) - parseAmount(b.min_amount);
      case 'duration_desc':
         // Parse duration to months for comparison
         const parseDuration = (str) => {
             const s = str.toLowerCase();
             let months = 0;
             if (s.includes('yil')) {
                 const years = parseFloat(s) || 0;
                 months += years * 12;
             }
             if (s.includes('oy')) {
                 // Try to extract number before 'oy', handling "1 yil 1 oy"
                 const parts = s.split(' ');
                 for(let i=0; i<parts.length; i++) {
                     if (parts[i].includes('oy')) {
                         const m = parseFloat(parts[i-1]) || 0;
                         months += m;
                     }
                 }
             }
             // Fallback for just "18 oy" or similar if logic above misses simple cases
             if (months === 0 && s.includes('oy')) {
                  months = parseFloat(s) || 0;
             }
             return months;
         };
         return parseDuration(b.duration) - parseDuration(a.duration);
      default:
        return b.rate - a.rate;
    }
  });

  const bestRate = Math.max(...savings.map(s => s.rate));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      {sortedSavings.map((item, index) => (
        <SavingsCard
          key={`${item.bank_name}-${index}`}
          savings={item}
          isBestRate={item.rate === bestRate}
        />
      ))}
    </div>
  );
};

export default SavingsList;
