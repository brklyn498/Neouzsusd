import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HistoryChart = ({ history, currency }) => {
  if (!history || history.length === 0) return (
      <div style={{
          width: '100%',
          marginTop: '2rem',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'white',
          border: '4px solid black',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          boxSizing: 'border-box',
          textAlign: 'center',
          fontWeight: 'bold'
      }}>
          No History Data Available for {currency}
      </div>
  );

  const data = history.map(item => {
    // Manually parse YYYY-MM-DD to avoid timezone issues
    const [year, month, day] = item.date.split('-').map(Number);
    // Create date object for sorting/compatibility if needed, but for display we use custom string
    // Actually, simply constructing the label string directly is safest.
    const dateObj = new Date(year, month - 1, day);
    const dateLabel = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    return {
      date: dateLabel,
      originalDate: item.date,
      rate: item.rate
    };
  });

  const minRate = Math.min(...data.map(d => d.rate)) * 0.99;
  const maxRate = Math.max(...data.map(d => d.rate)) * 1.01;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
          padding: '12px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 'bold'
        }}>
          <p style={{ margin: 0 }}>{payload[0].payload.originalDate}</p>
          <p style={{ margin: '4px 0 0 0', color: '#000', fontSize: '1.2em' }}>
            {payload[0].value.toLocaleString()} UZS
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    return Math.round(value).toLocaleString();
  };

  return (
    <div style={{
      width: '100%',
      marginTop: '2rem',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: 'white',
      border: '4px solid black',
      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
      boxSizing: 'border-box'
    }}>
      <h3 style={{
        fontWeight: 'bold',
        fontSize: '1.25rem',
        marginBottom: '1rem',
        color: 'black',
        textTransform: 'uppercase',
        letterSpacing: '-0.05em'
      }}>
        30-Day Trend ({currency})
      </h3>
      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={{ stroke: '#000', strokeWidth: 2 }}
              axisLine={{ stroke: '#000', strokeWidth: 3 }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              domain={[minRate, maxRate]}
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              tickFormatter={formatYAxis}
              tickLine={{ stroke: '#000', strokeWidth: 2 }}
              axisLine={{ stroke: '#000', strokeWidth: 3 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Line
              type="linear"
              dataKey="rate"
              stroke="#000"
              strokeWidth={4}
              dot={{ stroke: '#000', strokeWidth: 2, fill: '#CCFF00', r: 4 }}
              activeDot={{ stroke: '#000', strokeWidth: 2, fill: '#FF00FF', r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
