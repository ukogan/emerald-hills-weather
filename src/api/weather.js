// Main weather API endpoints for Emerald Hills Weather Dashboard
// Provides current conditions and forecast data with correlation analysis

const express = require('express');
const WeatherAPIService = require('../services/weatherAPI');
const BasicCorrelationAnalysis = require('../services/basicCorrelationAnalysis');
const { WEATHER_STATIONS, getStationsWithDistance, TARGET_LOCATION } = require('../utils/stationConfig');

const router = express.Router();
const weatherService = new WeatherAPIService();
const correlationAnalysis = new BasicCorrelationAnalysis();

// GET /api/weather/current - Get current conditions for target location
router.get('/current', async (req, res) => {
  try {
    const target = TARGET_LOCATION;
    
    const [openweatherResult, nwsResult] = await Promise.all([
      weatherService.getOpenWeatherCurrent(target.lat, target.lon),
      weatherService.getNWSCurrent(target.lat, target.lon)
    ]);
    
    res.json({
      success: true,
      location: target,
      openweather: openweatherResult,
      nws: nwsResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/stations - Get current conditions for all correlation stations
router.get('/stations', async (req, res) => {
  try {
    const stations = getStationsWithDistance();
    const results = {
      target: TARGET_LOCATION,
      stations: {},
      timestamp: new Date().toISOString()
    };
    
    // Get data for each station
    for (const station of stations.slice(0, 3)) { // Limit to 3 stations for now to avoid rate limits
      const [openweatherResult, nwsResult] = await Promise.all([
        weatherService.getOpenWeatherCurrent(station.lat, station.lon),
        weatherService.getNWSCurrent(station.lat, station.lon)
      ]);
      
      results.stations[station.key] = {
        station: station,
        openweather: openweatherResult,
        nws: nwsResult
      };
      
      // Small delay between stations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/test - Test API connectivity for all stations
router.get('/test', async (req, res) => {
  try {
    const testResults = await weatherService.testAllStations();
    
    res.json({
      success: true,
      ...testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/config - Get station configuration and status
router.get('/config', async (req, res) => {
  try {
    const stations = getStationsWithDistance();
    
    res.json({
      success: true,
      target: TARGET_LOCATION,
      stations: stations,
      api_status: {
        openweather_configured: !!process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your_openweather_api_key_here',
        nws_configured: true // NWS doesn't require API key
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/correlation - Basic correlation analysis for E1-T3
router.get('/correlation', async (req, res) => {
  try {
    const analysis = await correlationAnalysis.testCorrelationHypothesis();
    
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;