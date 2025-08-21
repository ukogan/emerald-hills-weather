// Vercel serverless function for weather API testing
const fetch = require('node-fetch');

const WEATHER_STATIONS = {
  redwood_city: { name: "Redwood City", lat: 37.4849, lon: -122.2364, elevation: 7 },
  san_mateo: { name: "San Mateo", lat: 37.4839, lon: -122.3131, elevation: 3 },
  palo_alto: { name: "Palo Alto (KPAO)", lat: 37.4611, lon: -122.115, elevation: 4 },
  san_jose: { name: "San Jose (KSJC)", lat: 37.3626, lon: -121.9294, elevation: 62 },
  half_moon_bay: { name: "Half Moon Bay", lat: 37.5114, lon: -122.4778, elevation: 67 }
};

async function getOpenWeatherData(lat, lon) {
  if (!process.env.OPENWEATHER_API_KEY) {
    return { success: false, error: "API key not configured" };
  }
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      data: {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        conditions: data.weather[0].description,
        timestamp: new Date().toISOString(),
        source: "openweather"
      },
      raw: data
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  }
  
  try {
    const target = {
      name: "Emerald Hills",
      lat: 37.4419,
      lon: -122.2708,
      elevation: 440,
      code: "TARGET"
    };
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      target: target,
      stations: {},
      summary: { openweather: { success: 0, failed: 0, errors: [] } }
    };
    
    // Test a few key stations
    const testStations = ['redwood_city', 'san_mateo', 'palo_alto'];
    
    for (const stationKey of testStations) {
      const station = WEATHER_STATIONS[stationKey];
      if (station) {
        const distance = Math.sqrt(
          Math.pow((station.lat - target.lat) * 69, 2) + 
          Math.pow((station.lon - target.lon) * 53, 2)
        );
        
        const openweatherResult = await getOpenWeatherData(station.lat, station.lon);
        
        results.stations[stationKey] = {
          station: { ...station, key: stationKey, distance_miles: distance },
          openweather: openweatherResult
        };
        
        if (openweatherResult.success) {
          results.summary.openweather.success++;
        } else {
          results.summary.openweather.failed++;
          results.summary.openweather.errors.push(openweatherResult.error);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}