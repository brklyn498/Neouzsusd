import React, { useState, useEffect } from 'react';
import { requestForToken, unsubscribeUser, onMessageListener } from '../firebase-config';

const NotificationToggle = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({title: '', body: ''});

  useEffect(() => {
    // Check if user has already granted permission
    if (Notification.permission === 'granted') {
       setIsSubscribed(true);
    }

    // Set up listener for foreground messages
    const unsubscribe = onMessageListener((payload) => {
        setNotification({
            title: payload.notification.title,
            body: payload.notification.body
        });
    });

    // Cleanup listener on unmount
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSubscription = async () => {
    setLoading(true);
    if (isSubscribed) {
      // Unsubscribe logic
      await unsubscribeUser();
      setIsSubscribed(false);
      alert("Unsubscribed from rate alerts.");
    } else {
      // Subscribe logic
      const token = await requestForToken();
      if (token) {
        setIsSubscribed(true);
        alert("Subscribed to rate alerts! You will be notified of major changes.");
      } else {
        alert("Failed to subscribe. Please enable notifications in your browser settings.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
        <button
            onClick={handleSubscription}
            disabled={loading}
            className="brutal-btn"
            style={{
                fontSize: '0.8rem',
                padding: '0.5rem 1rem',
                backgroundColor: isSubscribed ? 'var(--accent-pink)' : 'var(--card-bg)',
                color: isSubscribed ? '#FFFFFF' : 'var(--text-color)'
            }}
        >
            {loading ? 'PROCESSING...' : (isSubscribed ? '🔕 DISABLE ALERTS' : '🔔 ENABLE ALERTS')}
        </button>
        {notification.title && (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'var(--accent-cyan)',
                border: '3px solid black',
                padding: '1rem',
                zIndex: 1000,
                boxShadow: '4px 4px 0 black'
            }}>
                <strong>{notification.title}</strong>
                <p style={{margin: '5px 0 0 0'}}>{notification.body}</p>
                <button onClick={() => setNotification({title: '', body: ''})} style={{marginTop: '10px', background: 'black', color: 'white', border: 'none', padding: '5px'}}>CLOSE</button>
            </div>
        )}
    </div>
  );
};

export default NotificationToggle;
