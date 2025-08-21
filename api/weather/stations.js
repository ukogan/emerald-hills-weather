// Vercel serverless function for weather stations comparison
const fetch = require('node-fetch');

const WEATHER_STATIONS = {
  redwood_city: { name: "Redwood City", lat: 37.4849, lon: -122.2364, elevation: 7 },
  san_mateo: { name: "San Mateo", lat: 37.4839, lon: -122.3131, elevation: 3 },
  palo_alto: { name: "Palo Alto (KPAO)", lat: 37.4611, lon: -122.115, elevation: 4 },
  san_jose: { name: "San Jose (KSJC)", lat: 37.3626, lon: -121.9294, elevation: 62 },
  half_moon_bay: { name: "Half Moon Bay", lat: 37.5114, lon: -122.4778, elevation: 67 }
};

async function getWeatherData(lat, lon) {
  if (!process.env.OPENWEATHER_API_KEY) {
    return { success: false, error: "API key not configured" };
  }
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const target = {
      name: "Emerald Hills",
      lat: 37.4419,
      lon: -122.2708,
      elevation: 440
    };
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      target: target,
      stations: {}
    };
    
    // Get data for each station (limit to 3 to avoid rate limits)
    const stationKeys = Object.keys(WEATHER_STATIONS).slice(0, 3);
    
    for (const stationKey of stationKeys) {
      const station = WEATHER_STATIONS[stationKey];
      const distance = Math.sqrt(
        Math.pow((station.lat - target.lat) * 69, 2) + 
        Math.pow((station.lon - target.lon) * 53, 2)
      );
      
      const weatherData = await getWeatherData(station.lat, station.lon);
      
      results.stations[stationKey] = {
        station: { 
          ...station, 
          key: stationKey, 
          distance_miles: distance 
        },
        weather: weatherData
      };
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
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