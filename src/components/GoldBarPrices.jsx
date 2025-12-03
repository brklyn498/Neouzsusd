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
                    <div key={bar.weight} className="gold-bar-item">
                        <div className="gold-weight">{bar.weight}</div>
                        <div className="gold-price">{formatPrice(bar.price)} сўм</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
