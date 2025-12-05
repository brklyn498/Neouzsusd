import React, { useState } from 'react';
import NewsCard from './NewsCard';
import ArticleModal from './ArticleModal';

const NewsFeed = ({ news, darkMode, selectedTag, selectedSource }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (!news || !news.items || news.items.length === 0) {
    return (
      <div className="brutal-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
        <h3>NO NEWS AVAILABLE</h3>
        <p>Check back later for financial updates.</p>
      </div>
    );
  }

  // Filter news by selected tag and/or source
  let filteredNews = news.items;

  // Filter by source first
  if (selectedSource) {
    filteredNews = filteredNews.filter(item => {
      // Check if source matches (partial match for flexibility)
      return item.source && item.source.toLowerCase().includes(selectedSource.toLowerCase());
    });
  }

  // Then filter by tag
  if (selectedTag) {
    filteredNews = filteredNews.filter(item => {
      const searchText = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
      return searchText.includes(selectedTag.toLowerCase());
    });
  }

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="news-feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>
          FINANCIAL NEWS
          {selectedSource && (
            <span style={{ fontSize: '0.8rem', marginLeft: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#FF00FF', color: '#fff', verticalAlign: 'middle' }}>
              📰 {selectedSource.toUpperCase()}
            </span>
          )}
          {selectedTag && (
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#00FFFF', color: '#000', verticalAlign: 'middle' }}>
              #{selectedTag.toUpperCase()}
            </span>
          )}
        </h2>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {(selectedTag || selectedSource) ? `${filteredNews.length} of ${news.items.length}` : news.items.length} ARTICLES
        </span>
      </div>

      {filteredNews.length === 0 ? (
        <div className="brutal-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
          <h3>NO MATCHING ARTICLES</h3>
          <p>No articles found{selectedSource ? ` from "${selectedSource}"` : ''}{selectedTag ? ` matching "${selectedTag}"` : ''}. Try a different filter.</p>
        </div>
      ) : (
        <div className="news-grid">
          {filteredNews.map((item, index) => (
            <NewsCard
              key={item.id}
              item={item}
              darkMode={darkMode}
              onClick={handleArticleClick}
            />
          ))}
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={handleCloseModal}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default NewsFeed;
