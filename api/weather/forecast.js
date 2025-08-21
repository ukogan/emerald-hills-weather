// Vercel serverless function for weather forecast
const fetch = require('node-fetch');

export default async function handler(req, res) {
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
    
    // Try to get forecast data from OpenWeather if API key is available
    let forecastData = null;
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const openWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${target.lat}&lon=${target.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`;
        const response = await fetch(openWeatherUrl);
        if (response.ok) {
          const data = await response.json();
          forecastData = {
            success: true,
            data: {
              location: target,
              forecast: data.list.slice(0, 8).map(item => ({
                time: item.dt_txt,
                temperature: item.main.temp,
                feels_like: item.main.feels_like,
                humidity: item.main.humidity,
                conditions: item.weather[0].description,
                timestamp: new Date().toISOString()
              })),
              source: "openweather"
            }
          };
        }
      } catch (error) {
        console.error('OpenWeather forecast API error:', error);
      }
    }
    
    res.json({
      success: true,
      location: target,
      forecast: forecastData || { success: false, error: "API key not configured" },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}