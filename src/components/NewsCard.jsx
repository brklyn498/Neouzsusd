import React from 'react';

// Flag SVG URLs
const FLAG_URLS = {
  EN: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
  RU: 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg',
  UZ: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Uzbekistan.svg',
};

const NewsCard = ({ item, darkMode, onClick }) => {
  const { title, summary, source, published_at, category, language, image_url, source_url, reliability_tier, reliability_label } = item;

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

  // Handle card click (but not on direct link clicks)
  const handleCardClick = (e) => {
    // Don't trigger if clicking on the external link
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    if (onClick) onClick(item);
  };

  // Language badge component with SVG flag
  const LanguageBadge = ({ lang }) => {
    if (!lang) return null;
    const flagUrl = FLAG_URLS[lang];
    const langLabel = lang === 'EN' ? 'EN' : lang === 'RU' ? 'RU' : lang === 'UZ' ? 'UZ' : lang;

    return (
      <span style={{
        backgroundColor: '#FFFFFF',
        color: '#000',
        padding: '2px 8px',
        border: '2px solid var(--border-color)',
        fontWeight: 'bold',
        fontSize: '0.65rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {flagUrl && (
          <img
            src={flagUrl}
            alt={`${lang} flag`}
            style={{
              width: '16px',
              height: '12px',
              objectFit: 'cover',
              border: '1px solid #ccc'
            }}
          />
        )}
        {langLabel}
      </span>
    );
  };

  // Category colors mapping
  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'economy': return '#CCFF00'; // Lime
      case 'banking': return '#00FFFF'; // Cyan
      case 'markets': return '#FF00FF'; // Magenta
      case 'business': return '#FF5200'; // Orange
      case 'regulation': return '#9D4EDD'; // Purple
      default: return '#00FFFF'; // Default Cyan
    }
  };

  // Reliability badge component (Task 3.5)
  const ReliabilityBadge = ({ tier, label }) => {
    if (!label) return null;

    const colors = {
      official: { bg: '#00FF00', text: '#000' },    // Green for official govt sources
      verified: { bg: '#00FFFF', text: '#000' },    // Cyan for verified outlets
      aggregator: { bg: '#FFCC00', text: '#000' },  // Yellow for aggregators
    };

    const style = colors[tier] || colors.verified;
    const icon = tier === 'official' || tier === 'verified' ? '✓' : '⚡';

    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '2px 6px',
        fontSize: '0.6rem',
        fontWeight: 'bold',
        border: '2px solid var(--border-color)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
      }}>
        {icon} {label}
      </span>
    );
  };

  const categoryColor = getCategoryColor(category);

  return (
    <div
      className="brutal-card animate-slide-in news-card-clickable"
      onClick={handleCardClick}
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
        cursor: 'pointer',
      }}
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#FFFFFF',
              color: '#000',
              padding: '2px 6px',
              border: '2px solid var(--border-color)'
            }}>
              {source}
            </span>
            <ReliabilityBadge tier={reliability_tier} label={reliability_label} />
            <LanguageBadge lang={language} />
            <span style={{
              backgroundColor: categoryColor,
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
          {title}
        </h3>

        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {summary}
        </p>

        {image_url && (
          <div style={{ marginTop: '0.5rem', border: '2px solid var(--border-color)', height: '150px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <img src={image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className="brutal-btn"
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              flex: 1,
              textAlign: 'center',
              fontWeight: 'bold'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(item);
            }}
          >
            READ MORE
          </button>
          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#FFFFFF',
              color: '#000',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
