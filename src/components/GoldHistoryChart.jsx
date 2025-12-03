import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceDot } from 'recharts';
import { useState, useMemo, useRef, useEffect } from 'react';

export default function GoldHistoryChart({ goldHistory }) {
    const [showTable, setShowTable] = useState(false);
    const containerRef = useRef(null);
    const badgeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [badgePosition, setBadgePosition] = useState(null); // { left: x, top: y }
    const dragOffset = useRef({ x: 0, y: 0 });

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

        // Calculate today's change (vs yesterday)
        const yesterdayPrice = history.length > 1 ? history[history.length - 2].price_usd_per_oz : lastPrice;
        const todayChange = lastPrice - yesterdayPrice;
        const todayChangePercent = (todayChange / yesterdayPrice) * 100;

        // Calculate 7-day moving average
        const dataWithMA = history.map((item, index) => {
            if (index < 6) return { ...item, ma7: null };
            const last7 = history.slice(index - 6, index + 1);
            const avg = last7.reduce((sum, d) => sum + d.price_usd_per_oz, 0) / 7;
            return { ...item, ma7: avg };
        });

        return {
            minPrice,
            maxPrice,
            minItem,
            maxItem,
            totalChange,
            totalChangePercent,
            todayChange,
            todayChangePercent,
            dataWithMA,
            lastPrice
        };
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

    const handleMouseDown = (e) => {
        if (!badgeRef.current || !containerRef.current) return;

        e.preventDefault(); // Prevent text selection

        const badgeRect = badgeRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // If first drag (no state yet), initialize state
        if (!badgePosition) {
             const initialLeft = badgeRect.left - containerRect.left;
             const initialTop = badgeRect.top - containerRect.top;
             setBadgePosition({ left: initialLeft, top: initialTop });
        }

        setIsDragging(true);

        // Offset relative to the badge itself
        dragOffset.current = {
            x: e.clientX - badgeRect.left,
            y: e.clientY - badgeRect.top
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current || !badgeRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();

            let newLeft = e.clientX - containerRect.left - dragOffset.current.x;
            let newTop = e.clientY - containerRect.top - dragOffset.current.y;

            // Constrain
            const badgeWidth = badgeRef.current.offsetWidth;
            const badgeHeight = badgeRef.current.offsetHeight;
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            // Clamp
            newLeft = Math.max(0, Math.min(newLeft, containerWidth - badgeWidth));
            newTop = Math.max(0, Math.min(newTop, containerHeight - badgeHeight));

            setBadgePosition({ left: newLeft, top: newTop });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="brutal-card gold-history-card">
            <div className="card-header">
                <div>
                    <span className="gold-icon">📈</span>
                    <h3>GOLD PRICE HISTORY (30 DAYS)</h3>
                </div>
            </div>

            <div className="chart-container" style={{ position: 'relative' }} ref={containerRef}>
                {/* Today's Price Badge */}
                <div
                    className="today-price-badge"
                    ref={badgeRef}
                    onMouseDown={handleMouseDown}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        ...(badgePosition ? {
                            left: badgePosition.left,
                            top: badgePosition.top,
                            right: 'auto',
                            bottom: 'auto',
                            position: 'absolute'
                        } : {})
                    }}
                >
                    <div className="badge-header">
                        <span className="badge-label">TODAY</span>
                    </div>
                    <div className="badge-price">${stats.lastPrice.toFixed(2)}</div>
                    <div className="badge-change-row">
                         <span style={{
                             color: '#000',
                             fontWeight: 'bold',
                             fontSize: '0.9rem'
                         }}>
                            {stats.todayChange >= 0 ? '▲' : '▼'} {Math.abs(stats.todayChangePercent).toFixed(2)}%
                         </span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={stats.dataWithMA}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--gold-accent)" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="var(--gold-accent)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="var(--text-color)" opacity={0.3} strokeWidth={1} vertical={true} horizontal={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-color)"
                            strokeWidth={4}
                            tick={{ fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 11 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                            interval="preserveStartEnd"
                            dy={10}
                        />
                        <YAxis
                            stroke="var(--text-color)"
                            strokeWidth={4}
                            tick={{ fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 13 }}
                            tickFormatter={(value) => `$${value}`}
                            domain={['auto', (dataMax) => dataMax * 1.1]}
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
                            label={{ value: 'MIN', position: 'bottom', fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 12 }}
                        />
                        <ReferenceDot
                            x={stats.maxItem.date}
                            y={stats.maxPrice}
                            r={6}
                            fill="var(--success-color)"
                            stroke="var(--text-color)"
                            strokeWidth={2}
                            label={{ value: 'MAX', position: 'top', fill: 'var(--text-color)', fontWeight: 'bold', fontSize: 12 }}
                        />

                        {/* Current Price Dot */}
                        <ReferenceDot
                            x={stats.dataWithMA[stats.dataWithMA.length - 1].date}
                            y={stats.lastPrice}
                            r={8}
                            fill="var(--gold-accent)"
                            stroke="var(--text-color)"
                            strokeWidth={3}
                        />

                        <Area
                            type="monotone"
                            dataKey="price_usd_per_oz"
                            stroke="var(--gold-accent)"
                            strokeWidth={5}
                            fill="url(#goldGradient)"
                            dot={false}
                        />

                        {/* 7-day moving average line */}
                        <Line
                            type="monotone"
                            dataKey="ma7"
                            stroke="var(--gold-dark)"
                            strokeWidth={3}
                            strokeDasharray="8 4"
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
