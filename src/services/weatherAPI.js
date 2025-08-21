// External weather API integration utilities
// Handles OpenWeatherMap and National Weather Service API calls

// Using native fetch (Node.js 18+)
require('dotenv').config();

const { WEATHER_STATIONS, getStationsWithDistance } = require('../utils/stationConfig');

class WeatherAPIService {
  constructor() {
    this.openWeatherKey = process.env.OPENWEATHER_API_KEY;
    this.nwsBaseUrl = process.env.NWS_API_BASE || 'https://api.weather.gov';
    this.rateLimits = {
      openweather: { calls: 0, lastReset: Date.now(), limit: 60 }, // 60 per minute
      nws: { calls: 0, lastReset: Date.now(), limit: 100 } // Conservative limit
    };
  }

  // Rate limiting helper
  checkRateLimit(service) {
    const now = Date.now();
    const limit = this.rateLimits[service];
    
    // Reset counter every minute
    if (now - limit.lastReset > 60000) {
      limit.calls = 0;
      limit.lastReset = now;
    }
    
    if (limit.calls >= limit.limit) {
      throw new Error(`Rate limit exceeded for ${service}. Try again later.`);
    }
    
    limit.calls++;
  }

  // OpenWeatherMap API calls
  async getOpenWeatherCurrent(lat, lon) {
    this.checkRateLimit('openweather');
    
    if (!this.openWeatherKey || this.openWeatherKey === 'your_openweather_api_key_here') {
      throw new Error('OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to .env');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherKey}&units=imperial`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${data.message || response.statusText}`);
      }
      
      return {
        success: true,
        data: {
          temperature: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          conditions: data.weather[0].description,
          timestamp: new Date().toISOString(),
          source: 'openweather'
        },
        raw: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'openweather'
      };
    }
  }

  // National Weather Service API calls
  async getNWSCurrent(lat, lon) {
    this.checkRateLimit('nws');
    
    try {
      // Step 1: Get the grid point for this location
      const pointUrl = `${this.nwsBaseUrl}/points/${lat},${lon}`;
      const pointResponse = await fetch(pointUrl);
      const pointData = await pointResponse.json();
      
      if (!pointResponse.ok) {
        throw new Error(`NWS Point API error: ${pointData.detail || pointResponse.statusText}`);
      }
      
      // Step 2: Get current observations from the nearest station
      const stationUrl = pointData.properties.observationStations;
      const stationResponse = await fetch(stationUrl);
      const stationData = await stationResponse.json();
      
      if (!stationResponse.ok || !stationData.features || stationData.features.length === 0) {
        throw new Error('No NWS stations found for this location');
      }
      
      // Step 3: Get latest observation from the first station
      const firstStation = stationData.features[0].id;
      const obsUrl = `${firstStation}/observations/latest`;
      const obsResponse = await fetch(obsUrl);
      const obsData = await obsResponse.json();
      
      if (!obsResponse.ok) {
        throw new Error(`NWS Observation API error: ${obsData.detail || obsResponse.statusText}`);
      }
      
      const props = obsData.properties;
      
      return {
        success: true,
        data: {
          temperature: props.temperature.value ? (props.temperature.value * 9/5 + 32) : null, // Convert C to F
          humidity: props.relativeHumidity.value,
          pressure: props.barometricPressure.value,
          conditions: props.textDescription,
          timestamp: props.timestamp,
          station: firstStation,
          source: 'nws'
        },
        stationInfo: {
          station: firstStation,
          gridX: pointData.properties.gridX,
          gridY: pointData.properties.gridY,
          office: pointData.properties.cwa
        },
        raw: obsData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'nws'
      };
    }
  }

  // Test API connectivity for all target stations
  async testAllStations() {
    const stations = getStationsWithDistance();
    const results = {
      timestamp: new Date().toISOString(),
      target: WEATHER_STATIONS.target,
      stations: {},
      summary: {
        openweather: { success: 0, failed: 0, errors: [] },
        nws: { success: 0, failed: 0, errors: [] }
      }
    };
    
    console.log(`Testing APIs for ${stations.length} weather stations...`);
    
    for (const station of stations) {
      console.log(`\nTesting ${station.name}...`);
      
      // Test OpenWeather
      const owResult = await this.getOpenWeatherCurrent(station.lat, station.lon);
      if (owResult.success) {
        results.summary.openweather.success++;
        console.log(`✅ OpenWeather: ${owResult.data.temperature}°F`);
      } else {
        results.summary.openweather.failed++;
        results.summary.openweather.errors.push(`${station.name}: ${owResult.error}`);
        console.log(`❌ OpenWeather: ${owResult.error}`);
      }
      
      // Test NWS
      const nwsResult = await this.getNWSCurrent(station.lat, station.lon);
      if (nwsResult.success) {
        results.summary.nws.success++;
        console.log(`✅ NWS: ${nwsResult.data.temperature}°F (${nwsResult.stationInfo.station})`);
      } else {
        results.summary.nws.failed++;
        results.summary.nws.errors.push(`${station.name}: ${nwsResult.error}`);
        console.log(`❌ NWS: ${nwsResult.error}`);
      }
      
      results.stations[station.key] = {
        station: station,
        openweather: owResult,
        nws: nwsResult
      };
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
}

module.exports = WeatherAPIService;