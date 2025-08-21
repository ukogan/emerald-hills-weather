// Quick API test script for E1-T1 validation
// Tests both OpenWeatherMap and NWS APIs for SF Peninsula stations

const WeatherAPIService = require('./src/services/weatherAPI');
const { getStationsWithDistance, TARGET_LOCATION } = require('./src/utils/stationConfig');

async function testAPIs() {
  console.log('🌤️  Emerald Hills Weather API Test');
  console.log('=====================================');
  console.log(`📍 Target: ${TARGET_LOCATION.name} (${TARGET_LOCATION.lat}, ${TARGET_LOCATION.lon})`);
  console.log('');

  const weatherService = new WeatherAPIService();
  
  // Test 1: NWS API for target location (no API key needed)
  console.log('🧪 Testing National Weather Service API...');
  try {
    const nwsResult = await weatherService.getNWSCurrent(TARGET_LOCATION.lat, TARGET_LOCATION.lon);
    if (nwsResult.success) {
      console.log('✅ NWS API working!');
      console.log(`   Temperature: ${nwsResult.data.temperature}°F`);
      console.log(`   Station: ${nwsResult.stationInfo.station}`);
      console.log(`   Conditions: ${nwsResult.data.conditions}`);
    } else {
      console.log('❌ NWS API failed:', nwsResult.error);
    }
  } catch (error) {
    console.log('❌ NWS API error:', error.message);
  }
  
  console.log('');

  // Test 2: OpenWeather API for target location  
  console.log('🧪 Testing OpenWeatherMap API...');
  try {
    const owResult = await weatherService.getOpenWeatherCurrent(TARGET_LOCATION.lat, TARGET_LOCATION.lon);
    if (owResult.success) {
      console.log('✅ OpenWeather API working!');
      console.log(`   Temperature: ${owResult.data.temperature}°F`);
      console.log(`   Feels like: ${owResult.data.feels_like}°F`);
      console.log(`   Conditions: ${owResult.data.conditions}`);
    } else {
      console.log('❌ OpenWeather API failed:', owResult.error);
    }
  } catch (error) {
    console.log('❌ OpenWeather API error:', error.message);
  }
  
  console.log('');
  
  // Test 3: Sample correlation stations
  console.log('🧪 Testing correlation stations...');
  const stations = getStationsWithDistance().slice(0, 2); // Test just 2 stations
  
  for (const station of stations) {
    console.log(`\n📍 Testing ${station.name} (${station.distance_miles.toFixed(1)} miles away):`);
    
    // NWS test
    try {
      const nwsResult = await weatherService.getNWSCurrent(station.lat, station.lon);
      if (nwsResult.success) {
        console.log(`   ✅ NWS: ${nwsResult.data.temperature}°F`);
      } else {
        console.log(`   ❌ NWS: ${nwsResult.error}`);
      }
    } catch (error) {
      console.log(`   ❌ NWS: ${error.message}`);
    }
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('');
  console.log('🎯 API Test Summary:');
  console.log('   NWS: No API key required, direct NOAA data');
  console.log('   OpenWeather: Requires API key, get yours at https://openweathermap.org/api');
  console.log('   Next: Add OPENWEATHER_API_KEY to .env file');
}

// Run the test
testAPIs().catch(console.error);