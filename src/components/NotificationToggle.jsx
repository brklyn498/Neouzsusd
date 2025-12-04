import React, { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase-config';

const NotificationToggle = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({title: '', body: ''});
  const [token, setToken] = useState('');

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
        setNotification({
            title: payload.notification.title,
            body: payload.notification.body
        });
    });
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSubscription = async () => {
    setLoading(true);
    const fetchedToken = await requestForToken();
    if (fetchedToken) {
      setToken(fetchedToken);
      // Copy to clipboard automatically if possible
      try {
        await navigator.clipboard.writeText(fetchedToken);
        alert("Token copied to clipboard! Add this to your GitHub Secrets as 'FCM_DEVICE_TOKEN'.");
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    } else {
      alert("Failed to get token. Please allow notifications.");
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
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)'
            }}
        >
            {loading ? 'GETTING TOKEN...' : '🔔 SETUP ALERTS'}
        </button>

        {token && (
            <div style={{ marginTop: '10px', fontSize: '0.7rem', wordBreak: 'break-all', textAlign: 'left', background: 'var(--card-bg)', padding: '5px', border: '1px solid var(--border-color)' }}>
                <strong>YOUR TOKEN (Add to GitHub Secrets):</strong><br/>
                {token}
            </div>
        )}

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
