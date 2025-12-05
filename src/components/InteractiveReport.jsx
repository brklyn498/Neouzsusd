import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { banksData, marketStructureData, largeBanksActivity, smallBanksActivity } from '../data/reportData';

const InteractiveReport = ({ darkMode }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // --- STYLES ---
    const cardStyle = {
        border: '3px solid var(--border-color)',
        boxShadow: '4px 4px 0 var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        transition: 'transform 0.2s ease-in-out',
    };

    const tabButtonStyle = (tabName) => ({
        padding: '0.75rem 1.5rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: '3px solid var(--border-color)',
        backgroundColor: activeTab === tabName ? (darkMode ? 'var(--accent-brand)' : 'var(--text-color)') : 'var(--card-bg)',
        color: activeTab === tabName ? '#FFFFFF' : 'var(--text-color)',
        boxShadow: activeTab === tabName ? 'none' : '4px 4px 0 var(--border-color)',
        transform: activeTab === tabName ? 'translate(2px, 2px)' : 'none',
        fontFamily: 'inherit',
        marginRight: '1rem',
        marginBottom: '0.5rem'
    });

    // --- DATA FILTERING ---
    const filteredBanks = useMemo(() => {
        return banksData.filter(bank => {
            const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bank.info.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || bank.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType]);

    // --- CUSTOM TOOLTIP ---
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '2px solid var(--border-color)',
                    padding: '10px',
                    fontWeight: 'bold',
                    boxShadow: '4px 4px 0 var(--border-color)'
                }}>
                    <p>{`${payload[0].name} : ${payload[0].value}${payload[0].unit || ''}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fade-in-brutal" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

            {/* HEADER SECTION */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '-1px'
                }}>
                    UzBank<span style={{ color: 'var(--accent-brand)' }}>Monitor</span>
                </h2>
                <p style={{ fontWeight: 'bold', opacity: 0.7 }}>Executive Banking Sector Analysis</p>
            </div>

            {/* NAVIGATION TABS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('overview')} style={tabButtonStyle('overview')}>MARKET OVERVIEW</button>
                <button onClick={() => setActiveTab('directory')} style={tabButtonStyle('directory')}>BANK DIRECTORY</button>
                <button onClick={() => setActiveTab('analysis')} style={tabButtonStyle('analysis')}>ACTIVITY RANKINGS</button>
            </div>

            {/* --- VIEW: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <div className="slide-in-brutal">
                    {/* KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={cardStyle}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7 }}>Total Active Banks</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-color)' }}>35</div>
                            <div style={{ color: '#10B981', fontWeight: 'bold' }}>+ Digital Entrants</div>
                        </div>
                        <div style={cardStyle}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7 }}>State Asset Share</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-color)' }}>~68%</div>
                            <div style={{ fontWeight: 'bold', opacity: 0.5 }}>Dominant Position</div>
                        </div>
                        <div style={cardStyle}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.7 }}>Privatization Trend</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-color)' }}>High</div>
                            <div style={{ fontWeight: 'bold', opacity: 0.5 }}>IPO & Sales Ongoing</div>
                        </div>
                    </div>

                    {/* CHART SECTION */}
                    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', width: '100%', textAlign: 'left' }}>Ownership Structure</h3>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={marketStructureData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="var(--border-color)"
                                        strokeWidth={2}
                                    >
                                        {marketStructureData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'left', width: '100%', fontSize: '0.9rem' }}>
                            <p><strong>State-Owned:</strong> NBU, Asaka, SQB (Large infrastructure financing)</p>
                            <p><strong>Private:</strong> Kapitalbank, Hamkorbank (Retail & SME leaders)</p>
                            <p><strong>Foreign/Digital:</strong> TBC, KDB, Ziraat (Niche & Tech focus)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VIEW: DIRECTORY --- */}
            {activeTab === 'directory' && (
                <div className="slide-in-brutal">
                    {/* CONTROLS */}
                    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search banks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                border: '3px solid var(--border-color)',
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                color: 'var(--text-color)',
                                fontWeight: 'bold',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                border: '3px solid var(--border-color)',
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                color: 'var(--text-color)',
                                fontWeight: 'bold',
                                fontFamily: 'inherit',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="All">All Ownership Types</option>
                            <option value="State">State-Owned</option>
                            <option value="Private">Private / Joint Stock</option>
                            <option value="Foreign">Foreign Subsidiary</option>
                        </select>
                    </div>

                    {/* TABLE */}
                    <div style={{ overflowX: 'auto', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0 var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--card-bg)' }}>
                            <thead>
                                <tr style={{ borderBottom: '3px solid var(--border-color)', backgroundColor: darkMode ? '#334155' : '#f1f5f9' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '900' }}>BANK NAME</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '900' }}>EST.</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '900' }}>TYPE</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '900' }}>INSIGHTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBanks.length > 0 ? (
                                    filteredBanks.map((bank, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{bank.name}</td>
                                            <td style={{ padding: '1rem' }}>{bank.date}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    border: '2px solid var(--border-color)',
                                                    backgroundColor: bank.type === 'State' ? '#93C5FD' : bank.type === 'Private' ? '#6EE7B7' : '#FCD34D',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem',
                                                    boxShadow: '2px 2px 0 var(--border-color)'
                                                }}>
                                                    {bank.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{bank.info}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', fontWeight: 'bold' }}>No banks found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- VIEW: ANALYSIS --- */}
            {activeTab === 'analysis' && (
                <div className="slide-in-brutal">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                        {/* LARGE BANKS CHART */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Large Banks: Activity Leaders</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={largeBanksActivity} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.3} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--text-color)', fontSize: 12, fontWeight: 'bold' }} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="score" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20}>
                                            {largeBanksActivity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.type === 'Private' ? '#10B981' : '#3B82F6'} stroke="var(--border-color)" strokeWidth={2} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: '#10B981', border: '1px solid black' }}></div> Private</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: '#3B82F6', border: '1px solid black' }}></div> State</div>
                            </div>
                        </div>

                        {/* SMALL BANKS CHART */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Small/Medium Banks: Efficiency</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={smallBanksActivity} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.3} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--text-color)', fontSize: 12, fontWeight: 'bold' }} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="score" fill="#64748B" radius={[0, 4, 4, 0]} barSize={20} stroke="var(--border-color)" strokeWidth={2} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* METHODOLOGY */}
                    <div style={{
                        ...cardStyle,
                        backgroundColor: darkMode ? '#1e3a8a' : '#eff6ff',
                        borderColor: darkMode ? '#60a5fa' : '#bfdbfe'
                    }}>
                        <h3 style={{ color: darkMode ? '#93c5fd' : '#1e40af', fontWeight: '900', marginBottom: '1rem' }}>Understanding the Activity Index</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                                <h4 style={{ fontWeight: 'bold', color: darkMode ? '#bfdbfe' : '#1e3a8a' }}>Intermediation</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Ratio of term deposits to loans and ability to attract funds.</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
                                <h4 style={{ fontWeight: 'bold', color: darkMode ? '#bfdbfe' : '#1e3a8a' }}>Profitability</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Net Interest Margin (NIM), ROA, and ROE.</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
                                <h4 style={{ fontWeight: 'bold', color: darkMode ? '#bfdbfe' : '#1e3a8a' }}>Asset Quality</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Share of problem loans (NPL) and capital adequacy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveReport;
