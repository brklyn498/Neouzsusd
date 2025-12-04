import React from 'react';
import GlitchLogo from './GlitchLogo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            gridColumn: '1 / -1',
            marginTop: '4rem',
            borderTop: '3px solid var(--border-color)',
            paddingTop: '2rem',
            paddingBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center'
        }}>
            {/* Brand */}
            <div style={{ transform: 'scale(0.8)' }}>
                <GlitchLogo />
            </div>

            {/* Credits */}
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                MADE WITH 💻 & ☕ IN <span style={{ textDecoration: 'underline', textDecorationThickness: '3px', textDecorationColor: 'var(--accent-brand)' }}>TASHKENT</span>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                    href="https://github.com/brklyn498/exchangeusduzs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn"
                    style={{
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)'
                    }}
                >
                    GITHUB
                </a>
                <a
                    href="#"
                    className="brutal-btn"
                    style={{
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--accent-cyan)',
                        color: '#000000'
                    }}
                    onClick={(e) => e.preventDefault()}
                >
                    TELEGRAM
                </a>
            </div>

            {/* Copyright */}
            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '1rem', fontFamily: 'monospace' }}>
                © {currentYear} NEOUZS. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
};

export default Footer;
