import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceDot } from 'recharts';
import { useState, useMemo } from 'react';

export default function GoldHistoryChart({ goldHistory }) {
    const [showTable, setShowTable] = useState(false);

    if (!goldHistory || !goldHistory.data || goldHistory.data.length === 0) {
        return null;
    }

    const history = goldHistory.data;

    // Calculate statistics
    const stats = useMemo(() => {
        const prices = history.map(d => d.price_usd_per_oz);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minItem = history.find(d => d.price_usd_per_oz === minPrice);
        const maxItem = history.find(d => d.price_usd_per_oz === maxPrice);

        const firstPrice = history[0].price_usd_per_oz;
        const lastPrice = history[history.length - 1].price_usd_per_oz;
        const totalChange = lastPrice - firstPrice;
        const totalChangePercent = (totalChange / firstPrice) * 100;

        // Calculate 7-day moving average
        const dataWithMA = history.map((item, index) => {
            if (index < 6) return { ...item, ma7: null };
            const last7 = history.slice(index - 6, index + 1);
            const avg = last7.reduce((sum, d) => sum + d.price_usd_per_oz, 0) / 7;
            return { ...item, ma7: avg };
        });

        return { minPrice, maxPrice, minItem, maxItem, totalChange, totalChangePercent, dataWithMA };
    }, [history]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        const data = payload[0].payload;
        const prevPrice = history[history.indexOf(data) - 1]?.price_usd_per_oz || data.price_usd_per_oz;
        const change = data.price_usd_per_oz - prevPrice;
        const changePercent = (change / prevPrice) * 100;

        return (
            <div className="gold-tooltip">
                <p className="tooltip-date">{data.date}</p>
                <p className="tooltip-price">${data.price_usd_per_oz.toFixed(2)}/oz</p>
                {history.indexOf(data) > 0 && (
                    <p className={`tooltip-change ${change >= 0 ? 'positive' : 'negative'}`}>
                        {change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} ({changePercent.toFixed(2)}%)
                    </p>
                )}
                {data.ma7 && (
                    <p className="tooltip-ma">7-Day MA: ${data.ma7.toFixed(2)}</p>
                )}
            </div>
        );
    };

    return (
        <div className="brutal-card gold-history-card">
            <div className="card-header">
                <div>
                    <span className="gold-icon">📈</span>
                    <h3>GOLD PRICE HISTORY (30 DAYS)</h3>
                </div>
                <div className="gold-stats">
                    <div className={`price-change ${stats.totalChange >= 0 ? 'positive' : 'negative'}`}>
                        {stats.totalChange >= 0 ? '▲' : '▼'} ${Math.abs(stats.totalChange).toFixed(2)}
                        ({stats.totalChangePercent.toFixed(2)}%)
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={stats.dataWithMA} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--gold-accent)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--gold-accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="var(--text-color)" opacity={0.2} strokeWidth={2} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-color)"
                            strokeWidth={3}
                            tick={{ fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                            interval="preserveStartEnd"
                            dy={10}
                        />
                        <YAxis
                            stroke="var(--text-color)"
                            strokeWidth={3}
                            tick={{ fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Min/Max markers */}
                        <ReferenceDot
                            x={stats.minItem.date}
                            y={stats.minPrice}
                            r={6}
                            fill="var(--danger-color)"
                            stroke="var(--text-color)"
                            strokeWidth={2}
                            label={{ value: 'MIN', position: 'bottom', fill: 'var(--text-color)', fontWeight: 'bold' }}
                        />
                        <ReferenceDot
                            x={stats.maxItem.date}
                            y={stats.maxPrice}
                            r={6}
                            fill="var(--success-color)"
                            stroke="var(--text-color)"
                            strokeWidth={2}
                            label={{ value: 'MAX', position: 'top', fill: 'var(--text-color)', fontWeight: 'bold' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="price_usd_per_oz"
                            stroke="var(--gold-accent)"
                            strokeWidth={4}
                            fill="url(#goldGradient)"
                            dot={false}
                        />

                        {/* 7-day moving average line */}
                        <Line
                            type="monotone"
                            dataKey="ma7"
                            stroke="var(--gold-dark)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-controls">
                <button className="brutal-button" onClick={() => setShowTable(!showTable)}>
                    {showTable ? 'HIDE TABLE' : 'SHOW TABLE'}
                </button>
            </div>

            {showTable && (
                <div className="gold-table-container">
                    <table className="gold-price-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>PRICE (USD/oz)</th>
                                <th>CHANGE</th>
                                <th>7-DAY AVG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.dataWithMA.slice().reverse().map((item, index) => {
                                const actualIndex = stats.dataWithMA.length - 1 - index;
                                const prevPrice = actualIndex > 0 ? stats.dataWithMA[actualIndex - 1].price_usd_per_oz : item.price_usd_per_oz;
                                const change = item.price_usd_per_oz - prevPrice;
                                const changePercent = (change / prevPrice) * 100;
                                const isMin = item.price_usd_per_oz === stats.minPrice;
                                const isMax = item.price_usd_per_oz === stats.maxPrice;

                                return (
                                    <tr key={item.date} className={`${isMin ? 'min-row' : ''} ${isMax ? 'max-row' : ''}`}>
                                        <td>{item.date}</td>
                                        <td className="price-cell">${item.price_usd_per_oz.toFixed(2)}</td>
                                        <td className={`change-cell ${change >= 0 ? 'positive' : 'negative'}`}>
                                            {actualIndex > 0 && (
                                                <>
                                                    {change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}
                                                    <span className="change-percent">({changePercent.toFixed(2)}%)</span>
                                                </>
                                            )}
                                            {actualIndex === 0 && '-'}
                                        </td>
                                        <td>{item.ma7 ? `$${item.ma7.toFixed(2)}` : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
