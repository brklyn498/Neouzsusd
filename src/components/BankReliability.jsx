import React, { useState, useMemo } from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

// Scoring weights for the display notice
const SCORING_CRITERIA = [
    { name: 'CERR Ranking', weight: '35%', description: 'Quarterly bank activity ranking from CERR.uz' },
    { name: 'Bank Age', weight: '20%', description: 'Years since CBU license issued' },
    { name: 'Indicators', weight: '20%', description: 'Average of 6 CERR performance indicators' },
    { name: 'Bank Type', weight: '15%', description: 'State-owned, Private, or Foreign' },
    { name: 'Trend', weight: '10%', description: 'Ranking change from previous quarter' },
];

// Helper to get tier color class
const getTierColorClass = (tier) => {
    switch (tier) {
        case 'A+': return 'tier-a-plus';
        case 'A': return 'tier-a';
        case 'B+': return 'tier-b-plus';
        case 'B': return 'tier-b';
        case 'C': return 'tier-c';
        default: return 'tier-c';
    }
};

// Trend indicator component
const TrendIndicator = ({ change }) => {
    if (change > 0) {
        return <span className="trend-up" title={`+${change} positions`}>▲ +{change}</span>;
    } else if (change < 0) {
        return <span className="trend-down" title={`${change} positions`}>▼ {change}</span>;
    }
    return <span className="trend-stable" title="No change">● 0</span>;
};

// Radar chart for bank indicators
const IndicatorRadarChart = ({ indicators, indicatorsList }) => {
    const chartData = indicatorsList.map(ind => ({
        indicator: ind.name.split(' ')[0], // Short name for chart
        fullName: ind.name,
        value: indicators[ind.id] || 0,
        fullMark: 100,
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--border-color)" strokeWidth={2} />
                <PolarAngleAxis
                    dataKey="indicator"
                    tick={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}
                    axisLine={false}
                />
                <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.4}
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#fff', stroke: '#22C55E', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#22C55E', strokeWidth: 3 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        border: '3px solid var(--border-color)',
                        boxShadow: '4px 4px 0 var(--shadow-color)',
                        borderRadius: 0,
                    }}
                    formatter={(value, name, props) => [
                        `${value}/100`,
                        props.payload.fullName
                    ]}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// Individual bank reliability card
const ReliabilityCard = ({ bank, indicatorsList, isExpanded, onToggle }) => {
    const bankTypeLabel = {
        'state-owned': '🏛️ STATE',
        'private': '🏢 PRIVATE',
        'foreign': '🌍 FOREIGN',
    };

    return (
        <div
            className={`reliability-card ${isExpanded ? 'expanded' : ''}`}
            style={{ animationDelay: `${bank.overall_rank * 50}ms` }}
        >
            <div className="reliability-card-header" onClick={onToggle}>
                <div className="reliability-rank">#{bank.overall_rank}</div>

                <div className="reliability-bank-info">
                    {bank.logo && (
                        <img
                            src={bank.logo}
                            alt={bank.name}
                            className="reliability-logo"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    )}
                    <div className="reliability-name-group">
                        <span className="reliability-bank-name">{bank.name}</span>
                        <span className="reliability-bank-type">
                            {bankTypeLabel[bank.bank_type] || bank.bank_type}
                        </span>
                    </div>
                </div>

                <div className="reliability-score-group">
                    <div
                        className={`reliability-tier-badge ${getTierColorClass(bank.tier)}`}
                        style={{ backgroundColor: bank.tier_color }}
                    >
                        {bank.tier}
                    </div>
                    <div className="reliability-score">{bank.score}</div>
                </div>

                <div className="reliability-meta">
                    <TrendIndicator change={bank.rank_change} />
                    <span className="reliability-category">
                        {bank.cerr_category === 'large' ? '📊 Large' : '📈 Small'}
                    </span>
                </div>

                <div className="reliability-expand-icon">
                    {isExpanded ? '▼' : '▶'}
                </div>
            </div>

            {isExpanded && (
                <div className="reliability-card-details animate-slide-down">
                    <div className="reliability-chart-section">
                        <h4>Performance Indicators</h4>
                        <IndicatorRadarChart
                            indicators={bank.indicators}
                            indicatorsList={indicatorsList}
                        />
                    </div>

                    <div className="reliability-stats">
                        <div className="reliability-stat">
                            <span className="stat-label">CERR Rank</span>
                            <span className="stat-value">#{bank.cerr_rank} ({bank.cerr_category})</span>
                        </div>
                        <div className="reliability-stat">
                            <span className="stat-label">License Year</span>
                            <span className="stat-value">{bank.license_year}</span>
                        </div>
                        <div className="reliability-stat">
                            <span className="stat-label">Age</span>
                            <span className="stat-value">{new Date().getFullYear() - bank.license_year} years</span>
                        </div>
                        <div className="reliability-stat">
                            <span className="stat-label">Tier</span>
                            <span className="stat-value">{bank.tier_label}</span>
                        </div>
                    </div>

                    <div className="reliability-indicators-list">
                        {indicatorsList.map(ind => (
                            <div key={ind.id} className="indicator-bar-row">
                                <span className="indicator-name">{ind.name}</span>
                                <div className="indicator-bar-container">
                                    <div
                                        className="indicator-bar-fill"
                                        style={{
                                            width: `${bank.indicators[ind.id] || 0}%`,
                                            backgroundColor: bank.indicators[ind.id] >= 70 ? '#22C55E' :
                                                bank.indicators[ind.id] >= 50 ? '#EAB308' : '#F97316'
                                        }}
                                    />
                                </div>
                                <span className="indicator-value">{bank.indicators[ind.id] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main BankReliability component
const BankReliability = ({ reliabilityData, setViewMode }) => {
    const [expandedBank, setExpandedBank] = useState(null);
    const [sortBy, setSortBy] = useState('score');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showCriteria, setShowCriteria] = useState(false);

    // Gradient Button Style
    const gradientButtonStyle = {
        background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 100%)', // Soft Indigo to Purple
        border: '3px solid var(--text-color)',
        padding: '1rem',
        width: '100%',
        fontWeight: '900',
        fontSize: '1.2rem',
        color: '#FFFFFF', // White text
        cursor: 'pointer',
        boxShadow: '6px 6px 0px 0px var(--text-color)',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        fontFamily: 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        textShadow: '1px 1px 0 rgba(0,0,0,0.2)'
    };

    if (!reliabilityData || !reliabilityData.banks) {
        return (
            <div className="brutal-card reliability-loading">
                <h3>⏳ Loading Reliability Data...</h3>
                <p>Bank reliability scores are being calculated.</p>
            </div>
        );
    }

    const { banks, indicators_list, data_sources, last_updated } = reliabilityData;

    // Sort and filter banks
    const processedBanks = useMemo(() => {
        let filtered = [...banks];

        // Filter by category
        if (filterCategory !== 'all') {
            filtered = filtered.filter(b => b.cerr_category === filterCategory);
        }

        // Sort
        switch (sortBy) {
            case 'score':
                filtered.sort((a, b) => b.score - a.score);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'cerr':
                filtered.sort((a, b) => {
                    if (a.cerr_category !== b.cerr_category) {
                        return a.cerr_category === 'large' ? -1 : 1;
                    }
                    return a.cerr_rank - b.cerr_rank;
                });
                break;
            case 'age':
                filtered.sort((a, b) => a.license_year - b.license_year);
                break;
            default:
                break;
        }

        return filtered;
    }, [banks, sortBy, filterCategory]);

    const toggleExpand = (bankName) => {
        setExpandedBank(expandedBank === bankName ? null : bankName);
    };

    // Count tiers for summary
    const tierCounts = banks.reduce((acc, b) => {
        acc[b.tier] = (acc[b.tier] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="reliability-container">
            {/* Interactive Report Button */}
            <button
                style={gradientButtonStyle}
                onClick={() => setViewMode('report')}
                className="brutal-btn-hover-fix animate-pop-in" // Added animate-pop-in
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = '8px 8px 0px 0px var(--text-color)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '6px 6px 0px 0px var(--text-color)';
                }}
            >
                <span>📊</span> VIEW INTERACTIVE REPORT
            </button>

            {/* Header Section */}
            <div className="brutal-card reliability-header-card animate-slide-in">
                <div className="reliability-title-row">
                    <h2>🏦 Bank Reliability Scores</h2>
                    <span className="reliability-updated">Updated: {last_updated}</span>
                </div>

                <div className="reliability-summary">
                    <div className="tier-summary">
                        {Object.entries(tierCounts).sort().map(([tier, count]) => (
                            <span key={tier} className={`tier-count ${getTierColorClass(tier)}`}>
                                {tier}: {count}
                            </span>
                        ))}
                    </div>
                    <div className="reliability-total">
                        {banks.length} Banks Rated
                    </div>
                </div>
            </div>

            {/* Scoring Criteria Notice */}
            <div className="brutal-card criteria-notice animate-slide-in" style={{ animationDelay: '100ms' }}>
                <div
                    className="criteria-header"
                    onClick={() => setShowCriteria(!showCriteria)}
                >
                    <span>📊 Scoring Criteria</span>
                    <span className="criteria-toggle">{showCriteria ? '▼' : '▶'}</span>
                </div>

                {showCriteria && (
                    <div className="criteria-content animate-slide-down">
                        <p className="criteria-disclaimer">
                            ⚠️ <strong>Notice:</strong> Scores are calculated using the following weighted formula
                            based on official data from CBU.uz and CERR.uz:
                        </p>
                        <div className="criteria-list">
                            {SCORING_CRITERIA.map((c, i) => (
                                <div key={i} className="criteria-item">
                                    <span className="criteria-weight">{c.weight}</span>
                                    <span className="criteria-name">{c.name}</span>
                                    <span className="criteria-desc">{c.description}</span>
                                </div>
                            ))}
                        </div>
                        <div className="criteria-sources">
                            <strong>Official Sources:</strong>
                            <a href={data_sources?.cbu} target="_blank" rel="noopener noreferrer">
                                CBU.uz (Bank Registry)
                            </a>
                            <a href={data_sources?.cerr} target="_blank" rel="noopener noreferrer">
                                CERR.uz (Q3 2025 Ratings)
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="reliability-controls animate-slide-in" style={{ animationDelay: '150ms' }}>
                <div className="control-group">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="score">Reliability Score</option>
                        <option value="name">Bank Name</option>
                        <option value="cerr">CERR Ranking</option>
                        <option value="age">License Year</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>Category:</label>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('all')}
                        >
                            All ({banks.length})
                        </button>
                        <button
                            className={`filter-btn ${filterCategory === 'large' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('large')}
                        >
                            Large ({banks.filter(b => b.cerr_category === 'large').length})
                        </button>
                        <button
                            className={`filter-btn ${filterCategory === 'small' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('small')}
                        >
                            Small ({banks.filter(b => b.cerr_category === 'small').length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Bank List */}
            <div className="reliability-list">
                {processedBanks.map((bank, index) => (
                    <div
                        key={bank.name}
                        className="animate-slide-in"
                        style={{ animationDelay: `${200 + (index * 50)}ms` }}
                    >
                        <ReliabilityCard
                            bank={bank}
                            indicatorsList={indicators_list || []}
                            isExpanded={expandedBank === bank.name}
                            onToggle={() => toggleExpand(bank.name)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BankReliability;
