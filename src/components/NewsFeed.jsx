import React, { useState, useMemo } from 'react';
import NewsCard from './NewsCard';
import ArticleModal from './ArticleModal';
import NewsSearch from './NewsSearch';
import { useBookmarks } from '../hooks/useBookmarks';

const ITEMS_PER_PAGE = 10;

const NewsFeed = ({ news, darkMode, selectedTag, selectedSource }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  if (!news || !news.items || news.items.length === 0) {
    return (
      <div className="brutal-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
        <h3>NO NEWS AVAILABLE</h3>
        <p>Check back later for financial updates.</p>
      </div>
    );
  }

  // Filter news logic
  const filteredNews = useMemo(() => {
    let items = showBookmarksOnly ? bookmarks : news.items;

    // Filter by source
    if (selectedSource && !showBookmarksOnly) {
      items = items.filter(item =>
        item.source && item.source.toLowerCase().includes(selectedSource.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag && !showBookmarksOnly) {
      items = items.filter(item => {
        const searchText = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
        return searchText.includes(selectedTag.toLowerCase());
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const summaryMatch = item.summary?.toLowerCase().includes(query);
        return titleMatch || summaryMatch;
      });
    }

    return items;
  }, [news.items, bookmarks, showBookmarksOnly, selectedSource, selectedTag, searchQuery]);

  // Pagination logic
  const visibleNews = filteredNews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredNews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className="brutal-btn"
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: showBookmarksOnly ? 'var(--accent-pink)' : 'var(--card-bg)',
              color: showBookmarksOnly ? '#000' : 'var(--text-color)',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {showBookmarksOnly ? '★ SAVED' : '☆ SAVED'} ({bookmarks.length})
          </button>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            {filteredNews.length} ARTICLES
          </span>
        </div>
      </div>

      <NewsSearch onSearch={setSearchQuery} />

      {filteredNews.length === 0 ? (
        <div className="brutal-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
          <h3>NO MATCHING ARTICLES</h3>
          <p>No articles found{selectedSource ? ` from "${selectedSource}"` : ''}{selectedTag ? ` matching "${selectedTag}"` : ''}{searchQuery ? ` for "${searchQuery}"` : ''}. Try a different filter.</p>
        </div>
      ) : (
        <>
          <div className="news-grid">
            {visibleNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                darkMode={darkMode}
                onClick={handleArticleClick}
                onBookmark={toggleBookmark}
                isBookmarked={isBookmarked(item.id)}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="brutal-btn"
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '1rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              LOAD MORE ({filteredNews.length - visibleCount} REMAINING)
            </button>
          )}
        </>
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
