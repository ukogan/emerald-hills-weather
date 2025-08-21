import React from 'react';

function StationComparison({ data, loading }) {
  if (loading) {
    return (
      <div className="weather-card">
        <h2>Station Comparison</h2>
        <div className="loading">
          <div className="spinner"></div>
          Loading stations...
        </div>
      </div>
    );
  }

  if (!data || !data.success || !data.stations) {
    return (
      <div className="weather-card">
        <h2>Station Comparison</h2>
        <div className="error">
          <p>Unable to load station data</p>
          {data?.error && <p className="text-small">{data.error}</p>}
        </div>
      </div>
    );
  }

  const { stations: stationsData, target } = data;
  
  // Convert stations object to array format for display
  const stations = Object.entries(stationsData || {}).map(([key, station]) => {
    // Use OpenWeather as primary source, fallback to NWS
    const weatherData = station.openweather?.success ? station.openweather.data : 
                        station.nws?.success ? station.nws.data : null;
    
    return {
      name: station.station?.name || key,
      location: station.station?.notes || '',
      temperature: weatherData?.temperature || 0,
      conditions: weatherData?.conditions || 'Unknown',
      source: weatherData?.source || 'unavailable'
    };
  }).filter(station => station.temperature > 0); // Filter out stations with no data
  
  const correlationNote = `Showing ${stations.length} nearby stations for correlation analysis`;

  // Format temperature for display
  const formatTemp = (temp) => {
    if (typeof temp === 'number') {
      return Math.round(temp * 10) / 10;
    }
    return temp;
  };

  // Get station type emoji
  const getStationIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('san jose') || nameLower.includes('inland')) return '🏙️';
    if (nameLower.includes('half moon bay') || nameLower.includes('coastal')) return '🌊';
    if (nameLower.includes('palo alto') || nameLower.includes('emerald')) return '🏔️';
    return '🌡️';
  };

  // Sort stations by temperature (hottest first) to show correlation patterns
  const sortedStations = [...stations].sort((a, b) => {
    const tempA = typeof a.temperature === 'number' ? a.temperature : 0;
    const tempB = typeof b.temperature === 'number' ? b.temperature : 0;
    return tempB - tempA;
  });

  return (
    <div className="weather-card">
      <h2>Nearby Stations</h2>
      <p style={{ 
        fontSize: '0.9rem', 
        color: '#636e72', 
        margin: '0 0 16px 0' 
      }}>
        Temperature comparison across SF Peninsula
      </p>

      <ul className="station-list">
        {sortedStations.map((station, index) => (
          <li key={station.name || index} className="station-item">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
                {getStationIcon(station.name)}
              </span>
              <div>
                <div className="station-name">
                  {station.name || `Station ${index + 1}`}
                </div>
                {station.location && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#636e72',
                    marginTop: '2px'
                  }}>
                    {station.location}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div className="station-temp">
                {formatTemp(station.temperature)}°F
              </div>
              {station.conditions && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#636e72',
                  marginTop: '2px'
                }}>
                  {station.conditions}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Show temperature range for microclimate analysis */}
      {sortedStations.length > 1 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(116, 185, 255, 0.1)',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            📊 Microclimate Analysis
          </div>
          <div style={{ color: '#636e72' }}>
            Temperature range: {formatTemp(Math.min(...sortedStations.map(s => s.temperature)))}°F 
            {' - '}
            {formatTemp(Math.max(...sortedStations.map(s => s.temperature)))}°F
            {' '}
            ({formatTemp(Math.max(...sortedStations.map(s => s.temperature)) - 
                        Math.min(...sortedStations.map(s => s.temperature)))}°F spread)
          </div>
        </div>
      )}

      {correlationNote && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#636e72'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            🎯 Correlation Insight
          </div>
          {correlationNote}
        </div>
      )}

      <div style={{ 
        marginTop: '16px',
        fontSize: '0.8rem',
        color: '#636e72',
        textAlign: 'center'
      }}>
        Data sources: National Weather Service & OpenWeatherMap
      </div>
    </div>
  );
}

export default StationComparison;