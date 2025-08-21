import React from 'react';

function ForecastDisplay({ data, loading, error }) {
  if (loading) {
    return (
      <div className="weather-card">
        <h2>Emerald Hills Forecast</h2>
        <div className="loading">
          <div className="spinner"></div>
          Loading personalized forecast...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="weather-card">
        <h2>Emerald Hills Forecast</h2>
        <div className="error">
          <p>Forecast temporarily unavailable</p>
          <p className="text-small">
            {error || 'Forecast API not yet implemented'}
          </p>
        </div>
      </div>
    );
  }

  // Handle forecast API response structure
  const { forecast, correlation, accuracy } = data;
  
  if (!forecast || forecast.length === 0) {
    return (
      <div className="weather-card">
        <h2>Emerald Hills Forecast</h2>
        <div className="error">
          <p>No forecast data available</p>
        </div>
      </div>
    );
  }

  // Format temperature for display
  const formatTemp = (temp) => {
    if (typeof temp === 'number') {
      return Math.round(temp * 10) / 10;
    }
    return temp || '--';
  };

  // Get forecast period name (Today, Tomorrow, etc.)
  const getPeriodName = (index, date) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    try {
      const forecastDate = new Date(date);
      return forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (e) {
      return `Day ${index + 1}`;
    }
  };

  // Get weather icon for forecast conditions
  const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️';
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('partly cloudy')) return '⛅';
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    if (conditionLower.includes('hot')) return '🔥';
    
    return '🌤️';
  };

  return (
    <div className="weather-card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ margin: 0 }}>Emerald Hills Forecast</h2>
        {accuracy && (
          <div style={{
            fontSize: '0.85rem',
            color: '#636e72',
            display: 'flex',
            alignItems: 'center'
          }}>
            🎯 {Math.round(accuracy)}% accurate
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {forecast.slice(0, 5).map((period, index) => (
          <div 
            key={period.date || index}
            style={{
              textAlign: 'center',
              padding: '12px',
              background: index === 0 ? 'rgba(116, 185, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              border: index === 0 ? '2px solid rgba(116, 185, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600',
              marginBottom: '8px',
              color: index === 0 ? '#0984e3' : '#2d3436'
            }}>
              {getPeriodName(index, period.date)}
            </div>
            
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {getWeatherIcon(period.conditions)}
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: '#e74c3c'
              }}>
                {formatTemp(period.high)}°
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: '#636e72'
              }}>
                {formatTemp(period.low)}°
              </div>
            </div>
            
            {period.conditions && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#636e72',
                marginTop: '4px'
              }}>
                {period.conditions}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Correlation insight */}
      {correlation && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            🎯 Personalized for Emerald Hills
          </div>
          <div style={{ color: '#636e72' }}>
            {correlation.source && (
              <span>
                Based on {correlation.source} correlation 
                {correlation.confidence && ` (${Math.round(correlation.confidence)}% confidence)`}
              </span>
            )}
            {correlation.adjustment && (
              <div style={{ marginTop: '4px' }}>
                Elevation adjustment: +{correlation.adjustment}°F vs sea level
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forecast comparison */}
      {data.comparison && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(116, 185, 255, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            📊 vs Generic SF Bay Forecast
          </div>
          <div style={{ color: '#636e72' }}>
            {data.comparison.difference && (
              <span>
                Expect {formatTemp(Math.abs(data.comparison.difference))}°F 
                {data.comparison.difference > 0 ? ' warmer' : ' cooler'} than coastal forecasts
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '16px',
        fontSize: '0.8rem',
        color: '#636e72',
        textAlign: 'center'
      }}>
        Personalized forecast for 440 ft elevation • Updated every 6 hours
      </div>
    </div>
  );
}

export default ForecastDisplay;