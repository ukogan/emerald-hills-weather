import React from 'react';

function CurrentConditions({ data, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="weather-card">
        <h2>Current Conditions</h2>
        <div className="loading">
          <div className="spinner"></div>
          Updating conditions...
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="weather-card">
        <h2>Current Conditions</h2>
        <div className="error">
          <p>Unable to load current conditions</p>
          {data?.error && <p className="text-small">{data.error}</p>}
        </div>
      </div>
    );
  }

  const { openweather, nws, location, timestamp } = data;
  
  // Use OpenWeather as primary source, fallback to NWS
  const weatherData = openweather?.success ? openweather.data : 
                      nws?.success ? nws.data : null;
  
  if (!weatherData) {
    return (
      <div className="weather-card">
        <h2>Current Conditions</h2>
        <div className="error">
          <p>No weather data available</p>
          <p className="text-small">Both OpenWeather and NWS sources unavailable</p>
        </div>
      </div>
    );
  }
  
  // Map the API data to component format
  const current = {
    temperature: weatherData.temperature,
    feelsLike: weatherData.feels_like,
    humidity: weatherData.humidity,
    pressure: weatherData.pressure,
    conditions: weatherData.conditions,
    windSpeed: weatherData.windSpeed,
    windDirection: weatherData.windDirection,
    elevation: location?.elevation
  };
  
  const lastUpdated = weatherData.timestamp;
  
  // Format temperature to 1 decimal place
  const formatTemp = (temp) => {
    if (typeof temp === 'number') {
      return Math.round(temp * 10) / 10;
    }
    return temp;
  };

  // Get weather icon or emoji based on conditions
  const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️';
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('partly cloudy')) return '⛅';
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    if (conditionLower.includes('wind')) return '💨';
    
    return '🌤️';
  };

  // Calculate time since last update
  const getTimeSinceUpdate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const updateTime = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just updated';
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
      return updateTime.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="weather-card" style={{ gridColumn: 'span 1' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ margin: 0 }}>Current Conditions</h2>
        <button
          onClick={onRefresh}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: '#636e72'
          }}
          disabled={loading}
        >
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '4rem', marginRight: '16px' }}>
          {getWeatherIcon(current?.conditions)}
        </div>
        <div>
          <div className="temperature">
            {formatTemp(current?.temperature)}
            <span className="temperature-unit">°F</span>
          </div>
          {current?.feelsLike && current.feelsLike !== current.temperature && (
            <div style={{ 
              fontSize: '1.1rem', 
              color: '#636e72',
              marginTop: '4px'
            }}>
              Feels like {formatTemp(current.feelsLike)}°F
            </div>
          )}
        </div>
      </div>

      {current?.conditions && (
        <div style={{ 
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: '500',
          marginBottom: '20px',
          color: '#2d3436'
        }}>
          {current.conditions}
        </div>
      )}

      {/* Enhanced Weather Metrics Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginTop: '20px'
      }}>
        {current?.humidity && (
          <div className="text-center">
            <div style={{ fontSize: '0.9rem', color: '#636e72', marginBottom: '4px' }}>
              💧 Humidity
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {Math.round(current.humidity)}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '2px' }}>
              {current.humidity > 70 ? 'High' : current.humidity > 40 ? 'Moderate' : 'Low'}
            </div>
          </div>
        )}

        {current?.pressure && (
          <div className="text-center">
            <div style={{ fontSize: '0.9rem', color: '#636e72', marginBottom: '4px' }}>
              📊 Pressure
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {Math.round(current.pressure * 0.02953 * 100) / 100} in
            </div>
            <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '2px' }}>
              {current.pressure > 1020 ? 'High' : current.pressure > 1010 ? 'Normal' : 'Low'}
            </div>
          </div>
        )}

        {current?.windSpeed !== undefined && (
          <div className="text-center">
            <div style={{ fontSize: '0.9rem', color: '#636e72', marginBottom: '4px' }}>
              💨 Wind
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {Math.round(current.windSpeed || 0)} mph
            </div>
            {current?.windDirection && (
              <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '2px' }}>
                {current.windDirection}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '2px' }}>
              {(current.windSpeed || 0) > 15 ? 'Breezy' : (current.windSpeed || 0) > 5 ? 'Light' : 'Calm'}
            </div>
          </div>
        )}

        {/* Visibility indicator */}
        <div className="text-center">
          <div style={{ fontSize: '0.9rem', color: '#636e72', marginBottom: '4px' }}>
            👁️ Visibility
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            {current?.conditions?.toLowerCase().includes('clear') ? '10+ mi' : 
             current?.conditions?.toLowerCase().includes('fog') || current?.conditions?.toLowerCase().includes('mist') ? '<6 mi' : 
             '6-10 mi'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '2px' }}>
            {current?.conditions?.toLowerCase().includes('clear') ? 'Excellent' : 
             current?.conditions?.toLowerCase().includes('fog') || current?.conditions?.toLowerCase().includes('mist') ? 'Poor' : 
             'Good'}
          </div>
        </div>
      </div>

      {location && (
        <div style={{ 
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(116, 185, 255, 0.1)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: '#636e72'
        }}>
          <div><strong>Location:</strong> {location.name}</div>
          {location.station && (
            <div><strong>Source:</strong> {location.station}</div>
          )}
          {lastUpdated && (
            <div><strong>Updated:</strong> {getTimeSinceUpdate(lastUpdated)}</div>
          )}
        </div>
      )}

      {current?.elevation && (
        <div style={{ 
          marginTop: '12px',
          fontSize: '0.85rem',
          color: '#636e72',
          textAlign: 'center'
        }}>
          📍 Elevation-adjusted for {current.elevation} ft
        </div>
      )}
    </div>
  );
}

export default CurrentConditions;