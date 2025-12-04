import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Robust formatting for Uzbekistan time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(time);
    const hours = parts.find(p => p.type === 'hour')?.value || '00';
    const minutes = parts.find(p => p.type === 'minute')?.value || '00';

    return (
        <div
            className="brutal-border brutal-shadow"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: 'var(--card-bg)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                minWidth: '100px',
                justifyContent: 'center',
                overflow: 'hidden',
                fontFamily: '"JetBrains Mono", monospace', // Ensure alignment
                lineHeight: 1
            }}
        >
            <span key={hours} className="animate-tick" style={{ display: 'inline-block' }}>
                {hours}
            </span>
            <span style={{ margin: '0 2px', display: 'inline-block' }}>:</span>
            <span key={minutes} className="animate-tick" style={{ display: 'inline-block' }}>
                {minutes}
            </span>
        </div>
    );
};

export default Clock;
