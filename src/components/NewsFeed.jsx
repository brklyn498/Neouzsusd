import React from 'react';
import NewsCard from './NewsCard';

const NewsFeed = ({ news, darkMode }) => {
  if (!news || !news.items || news.items.length === 0) {
    return (
      <div className="brutal-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
        <h3>NO NEWS AVAILABLE</h3>
        <p>Check back later for financial updates.</p>
      </div>
    );
  }

  return (
    <div className="news-feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>FINANCIAL NEWS</h2>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
           LAST UPDATED: {news.last_updated}
        </span>
      </div>

      <div className="news-grid">
        {news.items.map((item, index) => (
          <NewsCard key={item.id} item={item} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
