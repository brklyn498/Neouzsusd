import React from 'react';

// Flag SVG URLs
const FLAG_URLS = {
    EN: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
    RU: 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg',
    UZ: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Uzbekistan.svg',
};

const ArticleModal = ({ article, onClose, darkMode }) => {
    if (!article) return null;

    const { title, full_content, summary, source, source_url, published_at, category, language, image_url } = article;

    // Format date nicely
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get language label
    const getLanguageLabel = (lang) => {
        switch (lang) {
            case 'EN': return 'English';
            case 'RU': return 'Русский';
            case 'UZ': return "O'zbek";
            default: return lang;
        }
    };

    // Handle closing with animation
    const [isClosing, setIsClosing] = React.useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200); // Match animation duration
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Language badge component with SVG flag
    const LanguageBadge = ({ lang }) => {
        if (!lang) return null;
        const flagUrl = FLAG_URLS[lang];

        return (
            <span style={{
                backgroundColor: '#FFFFFF',
                color: '#000',
                padding: '4px 10px',
                border: '2px solid var(--border-color)',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                {flagUrl && (
                    <img
                        src={flagUrl}
                        alt={`${lang} flag`}
                        style={{
                            width: '20px',
                            height: '14px',
                            objectFit: 'cover',
                            border: '1px solid #ccc'
                        }}
                    />
                )}
                {getLanguageLabel(lang)}
            </span>
        );
    };

    return (
        <div
            className="article-modal-backdrop"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem',
                opacity: isClosing ? 0 : 1,
                transition: 'opacity 0.2s ease-out'
            }}
        >
            <div
                className="article-modal brutal-card"
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: 'var(--card-bg)',
                    border: '4px solid var(--border-color)',
                    boxShadow: '8px 8px 0 var(--border-color)',
                    position: 'relative',
                    animation: isClosing ? 'none' : 'slideInBrutal 0.3s ease-out',
                    transform: isClosing ? 'translateY(50px) scale(0.95)' : 'none',
                    opacity: isClosing ? 0 : 1,
                    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="brutal-btn"
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        color: '#FFFFFF'
                    }}
                >
                    ✕
                </button>

                {/* Header Image */}
                {image_url && (
                    <div style={{
                        width: '100%',
                        height: '250px',
                        overflow: 'hidden',
                        borderBottom: '3px solid var(--border-color)'
                    }}>
                        <img
                            src={image_url}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => e.target.parentElement.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Meta badges */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        <span style={{
                            backgroundColor: '#00FFFF',
                            color: '#000',
                            padding: '4px 8px',
                            border: '2px solid var(--border-color)'
                        }}>
                            {source}
                        </span>
                        <LanguageBadge lang={language} />
                        <span style={{
                            backgroundColor: '#FF00FF',
                            color: '#000',
                            padding: '4px 8px',
                            border: '2px solid var(--border-color)'
                        }}>
                            {category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.8rem',
                        lineHeight: '1.3',
                        marginBottom: '0.75rem',
                        fontFamily: 'var(--font-heading)',
                        paddingRight: '2rem'
                    }}>
                        {title}
                    </h1>

                    {/* Date */}
                    <p style={{
                        fontSize: '0.85rem',
                        opacity: 0.7,
                        marginBottom: '1.5rem',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        {formatDate(published_at)}
                    </p>

                    {/* Article Content */}
                    <div style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '2rem'
                    }}>
                        {full_content || summary}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        borderTop: '2px solid var(--border-color)',
                        paddingTop: '1.5rem'
                    }}>
                        <a
                            href={source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="brutal-btn"
                            style={{
                                textDecoration: 'none',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: '#00FFFF',
                                color: '#000',
                                fontWeight: 'bold',
                                flex: 1,
                                textAlign: 'center',
                                minWidth: '200px'
                            }}
                        >
                            READ ORIGINAL ARTICLE ↗
                        </a>
                        <button
                            onClick={handleClose}
                            className="brutal-btn"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                color: '#FFFFFF',
                                flex: 1,
                                minWidth: '150px'
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;
