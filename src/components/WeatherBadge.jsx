import React from 'react';

const WeatherBadge = ({ weather }) => {
  if (!weather) return null;

  const { aqi, temp, humidity, city, icon } = weather;

  // Determine AQI Color and Icon/Emoji
  let color = '#00E400'; // Good (Green)
  let statusEmoji = '🟢';
  let description = 'Good';

  if (aqi > 50 && aqi <= 100) {
    color = '#FFFF00'; // Moderate (Yellow)
    statusEmoji = '🟡';
    description = 'Moderate';
  } else if (aqi > 100 && aqi <= 150) {
    color = '#FF7E00'; // Unhealthy for Sensitive Groups (Orange)
    statusEmoji = '🟠';
    description = 'Sens. Unhealthy';
  } else if (aqi > 150 && aqi <= 200) {
    color = '#FF0000'; // Unhealthy (Red)
    statusEmoji = '🔴';
    description = 'Unhealthy';
  } else if (aqi > 200 && aqi <= 300) {
    color = '#8F3F97'; // Very Unhealthy (Purple)
    statusEmoji = '🟣';
    description = 'Very Unhealthy';
  } else if (aqi > 300) {
    color = '#7E0023'; // Hazardous (Maroon)
    statusEmoji = '☠️';
    description = 'Hazardous';
  }

  // Choose text color based on background luminance for readability if we used background,
  // but for now we are using the emoji/indicator.
  // We'll style it as a badge.

  return (
    <div
      className="brutal-border brutal-shadow"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'var(--card-bg)',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'help',
        marginLeft: 'auto', // Push to right if in flex container
        marginTop: '10px' // Spacing if stacked
      }}
      title={`${city}: ${temp}°C, Humidity ${humidity}%, PM2.5 details available via tooltip`}
    >
      <span style={{ fontSize: '1.2rem' }}>{statusEmoji}</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>AQI {aqi}</span>
        <span style={{ fontSize: '0.7rem' }}>{temp}°C</span>
      </span>
    </div>
  );
};

export default WeatherBadge;
