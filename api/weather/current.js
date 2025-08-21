// Vercel serverless function for current weather
const fetch = require('node-fetch');

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
    
    // Try to get weather data from OpenWeather if API key is available
    let weatherData = null;
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${target.lat}&lon=${target.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`;
        const response = await fetch(openWeatherUrl);
        if (response.ok) {
          const data = await response.json();
          weatherData = {
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
        }
      } catch (error) {
        console.error('OpenWeather API error:', error);
      }
    }
    
    res.json({
      success: true,
      location: target,
      weather: weatherData || { success: false, error: "API key not configured" },
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