export default function GoldBarPrices({ goldBars }) {
    if (!goldBars || goldBars.length === 0) {
        return null;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('uz-UZ').format(price);
    };

    return (
        <div className="brutal-card gold-bars-card">
            <div className="card-header">
                <span className="gold-icon">🪙</span>
                <h3>MB GOLD BARS</h3>
            </div>
            <div className="gold-bars-list">
                {goldBars.map((bar) => (
                    <div key={bar.weight} className="gold-bar-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '2px dashed var(--border-color)' }}>
                        <div className="gold-weight" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{bar.weight}</div>
                        <div className="gold-price" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--gold-dark)' }}>
                            {formatPrice(bar.price)} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>UZS</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
