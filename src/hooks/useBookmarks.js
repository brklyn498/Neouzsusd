import { useState, useEffect } from 'react';

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const saved = localStorage.getItem('news_bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load bookmarks:", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('news_bookmarks', JSON.stringify(bookmarks));
        } catch (e) {
            console.error("Failed to save bookmarks:", e);
        }
    }, [bookmarks]);

    const toggleBookmark = (article) => {
        setBookmarks(prev => {
            const exists = prev.some(b => b.id === article.id);
            if (exists) {
                return prev.filter(b => b.id !== article.id);
            } else {
                return [article, ...prev];
            }
        });
    };

    const isBookmarked = (articleId) => {
        return bookmarks.some(b => b.id === articleId);
    };

    return { bookmarks, toggleBookmark, isBookmarked };
}
