import React, { useEffect } from 'react';
import { getBankProfile, normalizeBankName } from '../data/bankProfiles';

const BankProfileModal = ({ bankName, bankData, onClose, darkMode }) => {
    // Get profile from our data
    const profile = getBankProfile(bankName);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // Get logo URL
    const getLogoSrc = () => {
        if (bankData?.logo) return bankData.logo;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(bankName)}&background=random&size=128`;
    };

    // Format the bank type badge
    const getTypeBadge = () => {
        const type = bankData?.type || 'private';
        const colors = {
            'state-owned': { bg: '#2563eb', text: 'STATE' },
            'private': { bg: '#10b981', text: 'PRIVATE' },
            'foreign': { bg: '#f59e0b', text: 'FOREIGN' }
        };
        return colors[type] || colors['private'];
    };

    const typeBadge = getTypeBadge();

    return (
        <div className="bank-modal-overlay" onClick={onClose}>
            <div
                className="bank-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button className="bank-modal-close" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="bank-modal-header">
                    <div className="bank-modal-logo">
                        <img
                            src={getLogoSrc()}
                            alt={bankName}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bankName)}&background=random&size=128`;
                            }}
                        />
                    </div>
                    <div className="bank-modal-title">
                        <h2>{bankName}</h2>
                        <div className="bank-modal-badges">
                            <span
                                className="bank-type-badge"
                                style={{ backgroundColor: typeBadge.bg }}
                            >
                                {typeBadge.text}
                            </span>
                            {bankData?.score && (
                                <span
                                    className="bank-score-badge"
                                    style={{ backgroundColor: bankData.tier_color || '#10b981' }}
                                >
                                    {bankData.tier || 'B'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exchange Rates (if available) */}
                {bankData?.buy && bankData?.sell && (
                    <div className="bank-modal-rates">
                        <div className="bank-modal-rate-box buy">
                            <span className="rate-label">BUY</span>
                            <span className="rate-value">{bankData.buy.toLocaleString()}</span>
                        </div>
                        <div className="bank-modal-rate-box sell">
                            <span className="rate-label">SELL</span>
                            <span className="rate-value">{bankData.sell.toLocaleString()}</span>
                        </div>
                        <div className="bank-modal-rate-box spread">
                            <span className="rate-label">SPREAD</span>
                            <span className="rate-value">{(bankData.sell - bankData.buy).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bank-modal-actions">
                    {profile?.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bank-action-btn website"
                        >
                            🌐 WEBSITE
                        </a>
                    )}
                    {/* Always show deposits button - links to our savings page */}
                    <button
                        onClick={() => {
                            onClose();
                            // Navigate to savings view - we'll trigger this via a custom approach
                            window.dispatchEvent(new CustomEvent('navigate-to-savings'));
                        }}
                        className="bank-action-btn savings"
                    >
                        💰 DEPOSITS
                    </button>
                    {profile?.telegram && (
                        <a
                            href={profile.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bank-action-btn telegram"
                        >
                            <img
                                src="/fc703a8d71ce.svg"
                                alt="Telegram"
                                style={{ width: '16px', height: '16px', marginRight: '4px' }}
                            />
                            TELEGRAM
                        </a>
                    )}
                </div>

                {/* Contact Info */}
                <div className="bank-modal-contact">
                    <h3>📍 CONTACT</h3>

                    {profile?.address && (
                        <div className="contact-row">
                            <span className="contact-icon">🏢</span>
                            <span>{profile.address}</span>
                        </div>
                    )}

                    {profile?.hotline && (
                        <a href={`tel:${profile.hotline}`} className="contact-row clickable">
                            <span className="contact-icon">📞</span>
                            <span>Hotline: <strong>{profile.hotline}</strong></span>
                        </a>
                    )}

                    {profile?.email && (
                        <a href={`mailto:${profile.email}`} className="contact-row clickable">
                            <span className="contact-icon">✉️</span>
                            <span>{profile.email}</span>
                        </a>
                    )}

                    {!profile && (
                        <div className="contact-row">
                            <span style={{ opacity: 0.6 }}>Contact info not available</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bank-modal-footer">
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                        Data from bank.uz • Updated hourly
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BankProfileModal;
