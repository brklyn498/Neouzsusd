import React from 'react';

const NewsCard = ({ item, darkMode }) => {
  const { title, summary, source, published_at, category, image_url, source_url } = item;

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const timeAgo = getRelativeTime(published_at);

  return (
    <div
      className="brutal-card animate-slide-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
        border: '3px solid var(--border-color)',
        boxShadow: '4px 4px 0 var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              backgroundColor: 'var(--accent-cyan)',
              color: '#000',
              padding: '2px 6px',
              border: '2px solid var(--border-color)'
            }}>
              {source}
            </span>
            <span style={{
              backgroundColor: 'var(--accent-pink)',
              color: '#000',
              padding: '2px 6px',
              border: '2px solid var(--border-color)'
            }}>
              {category}
            </span>
          </div>
          <span style={{ opacity: 0.7 }}>{timeAgo}</span>
        </div>

        <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem', lineHeight: '1.3' }}>
          <a href={source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            {title}
          </a>
        </h3>

        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {summary}
        </p>

        {image_url && (
          <div style={{ marginTop: '0.5rem', border: '2px solid var(--border-color)', height: '150px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <img src={image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <a
              href={source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn"
              style={{
                textDecoration: 'none',
                fontSize: '0.8rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--bg-color)',
                width: '100%',
                textAlign: 'center'
              }}
            >
              READ FULL ARTICLE ↗
            </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
