import React, { useState } from 'react';

export default function NewsSearch({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="brutal-search-form" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onSearch(e.target.value); // Real-time search
                }}
                placeholder="SEARCH NEWS..."
                className="brutal-input"
                style={{
                    flex: 1,
                    padding: '0.8rem',
                    border: '3px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    outline: 'none',
                    boxShadow: '4px 4px 0 var(--shadow-color)'
                }}
            />
            {query && (
                <button
                    type="button"
                    onClick={() => {
                        setQuery('');
                        onSearch('');
                    }}
                    className="brutal-btn"
                    style={{
                        padding: '0 1rem',
                        backgroundColor: 'var(--accent-pink)',
                        color: '#000',
                        border: '3px solid var(--border-color)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '4px 4px 0 var(--shadow-color)'
                    }}
                >
                    ✕
                </button>
            )}
        </form>
    );
}
