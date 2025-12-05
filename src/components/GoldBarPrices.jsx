export default function GoldBarPrices({ goldBars }) {
    if (!goldBars || goldBars.length === 0) {
        return null;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('uz-UZ').format(price);
    };

    // Function to get gradient color based on weight
    const getGoldGradient = (weight) => {
        const weightNum = parseInt(weight);
        // Lighter gold for smaller weights, darker/richer for heavier
        const gradients = {
            5: 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)',  // Pale gold
            10: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)', // Light gold
            20: 'linear-gradient(135deg, #FFC700 0%, #FFB700 100%)', // Medium gold
            50: 'linear-gradient(135deg, #FFB700 0%, #FF8C00 100%)', // Rich gold
            100: 'linear-gradient(135deg, #FF8C00 0%, #B8860B 100%)', // Dark gold
        };

        return gradients[weightNum] || gradients[10];
    };

    return (
        <div className="animate-slide-in">
            <div className="brutal-card gold-bars-card">
                <div className="card-header">
                    <span className="gold-icon">🪙</span>
                    <h3>MB GOLD BARS</h3>
                </div>
                <div className="gold-bars-list">
                    {goldBars.map((bar, index) => (
                        <div
                            key={`${bar.weight}-${bar.price}`}
                            className={`gold-bar-item animate-slide-in delay-${index % 20}`}
                            style={{
                                background: getGoldGradient(bar.weight),
                                boxShadow: '4px 4px 0 var(--border-color)'
                            }}
                        >
                            <div className="gold-weight">{bar.weight}</div>
                            <div className="gold-price">{formatPrice(bar.price)} сўм</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
