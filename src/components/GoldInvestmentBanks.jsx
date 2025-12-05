import { useState } from 'react';

const BANK_DATA = {
    nbu: {
        name: "NBU",
        fullName: "National Bank of Uzbekistan",
        product: "Золотой депозит",
        features: [
            "Min 5g in-branch, 0.1g via app",
            "No commission",
            "VAT exempt",
            "Partial withdrawals allowed"
        ],
        app: "Milliy",
        website: "https://nbu.uz/ru/fizicheskim-litsam-vklady/zolotoy-depozit",
        launched: "May 2025",
        type: "State-owned"
    },
    sqb: {
        name: "SQB",
        fullName: "Sanoat Qurilish Bank",
        product: "Gold Investment",
        features: [
            "1-25g per transaction",
            "Buy/sell via app",
            "Daily rate monitoring",
            "Residents & non-residents"
        ],
        app: "SQB Mobile",
        website: "https://sqb.uz/press-center/ads-ru/investiruyte-v-zoloto-legko-i-bezopasno/",
        contact: "+99871 200 43 43",
        type: "State-owned"
    }
};

export default function GoldInvestmentBanks() {
    const [hoveredBank, setHoveredBank] = useState(null);

    const handleLearnMore = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="animate-slide-in" style={{ marginTop: '1.5rem' }}>
            <div className="brutal-card gold-investment-section">
                <div className="card-header" style={{ marginBottom: '1rem' }}>
                    <span className="gold-icon">🏦</span>
                    <h3>INVEST IN REAL GOLD</h3>
                </div>

                <p style={{
                    fontSize: '0.85rem',
                    opacity: 0.8,
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                }}>
                    These state-owned banks offer gold investment products.
                    <span style={{ opacity: 0.6 }}> (Reference only, not affiliated)</span>
                </p>

                <div className="gold-banks-grid">
                    {Object.entries(BANK_DATA).map(([key, bank]) => (
                        <div
                            key={key}
                            className={`gold-bank-card ${hoveredBank === key ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredBank(key)}
                            onMouseLeave={() => setHoveredBank(null)}
                        >
                            <div className="bank-header">
                                <div className="bank-name-section">
                                    <h4>{bank.name}</h4>
                                    <span className="bank-type-badge">{bank.type}</span>
                                </div>
                            </div>

                            <div className="bank-product">
                                <span className="product-label">Product:</span>
                                <span className="product-name">{bank.product}</span>
                            </div>

                            <ul className="bank-features">
                                {bank.features.map((feature, idx) => (
                                    <li key={idx}>✓ {feature}</li>
                                ))}
                            </ul>

                            <div className="bank-app">
                                <span className="app-icon">📱</span>
                                <span>Via <strong>{bank.app}</strong> app</span>
                            </div>

                            <button
                                className="brutal-button gold-learn-more"
                                onClick={() => handleLearnMore(bank.website)}
                            >
                                LEARN MORE →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
