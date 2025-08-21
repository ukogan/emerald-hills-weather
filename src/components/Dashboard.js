import React, { useState, useEffect } from 'react';
import CurrentConditions from './CurrentConditions';
import StationComparison from './StationComparison';
import ForecastDisplay from './ForecastDisplay';
import Header from './Header';
import { fetchWeatherData, fetchForecastData } from '../services/apiService';

function Dashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [stationsData, setStationsData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastError, setForecastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchCurrentWeatherData();
    fetchCurrentForecastData();
    
    // Update current conditions every 30 minutes
    const weatherInterval = setInterval(fetchCurrentWeatherData, 30 * 60 * 1000);
    // Update forecast every 6 hours
    const forecastInterval = setInterval(fetchCurrentForecastData, 6 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(weatherInterval);
      clearInterval(forecastInterval);
    };
  }, []);

  const fetchCurrentWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const { weatherData: current, stationsData: stations, errors } = 
        await fetchWeatherData(controller.signal);

      // Set data even if some calls failed
      if (current) setWeatherData(current);
      if (stations) setStationsData(stations);

      // Handle partial failures gracefully
      if (errors.weather && errors.stations) {
        setError('Unable to load weather data. Please check your connection.');
      } else if (errors.weather) {
        setError('Current conditions unavailable, showing station data only.');
      } else if (errors.stations) {
        setError('Station comparison unavailable, showing current conditions only.');
      }

      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(`Weather service unavailable: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentForecastData = async () => {
    try {
      setForecastLoading(true);
      setForecastError(null);

      const controller = new AbortController();
      const forecastData = await fetchForecastData(controller.signal);
      
      if (forecastData) {
        setForecastData(forecastData);
      } else {
        setForecastError('Forecast API not yet available');
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setForecastError(err.message);
    } finally {
      setForecastLoading(false);
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="container">
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          Loading weather data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Header />
        <div className="error">
          <h3>Weather Service Unavailable</h3>
          <p>{error}</p>
          <button onClick={fetchCurrentWeatherData} style={{
            background: '#0984e3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <div className="weather-grid">
        <CurrentConditions 
          data={weatherData} 
          loading={loading}
          onRefresh={fetchCurrentWeatherData}
        />
        <StationComparison 
          data={stationsData}
          loading={loading}
        />
        <ForecastDisplay 
          data={forecastData}
          loading={forecastLoading}
          error={forecastError}
        />
      </div>
    </div>
  );
}

export default Dashboard;