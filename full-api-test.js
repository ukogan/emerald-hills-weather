// Comprehensive API test for all SF Peninsula stations
const WeatherAPIService = require('./src/services/weatherAPI');

async function fullAPITest() {
  console.log('🌤️  COMPREHENSIVE API VALIDATION TEST');
  console.log('======================================');
  
  const weatherService = new WeatherAPIService();
  const results = await weatherService.testAllStations();
  
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log('======================');
  console.log(`✅ OpenWeather successful: ${results.summary.openweather.success}/${results.summary.openweather.success + results.summary.openweather.failed}`);
  console.log(`✅ NWS successful: ${results.summary.nws.success}/${results.summary.nws.success + results.summary.nws.failed}`);
  
  if (results.summary.openweather.errors.length > 0) {
    console.log('\n❌ OpenWeather errors:');
    results.summary.openweather.errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (results.summary.nws.errors.length > 0) {
    console.log('\n❌ NWS errors:');
    results.summary.nws.errors.forEach(error => console.log(`   ${error}`));
  }
  
  console.log('\n🎯 CORRELATION ANALYSIS PREVIEW:');
  console.log('=================================');
  const stations = Object.values(results.stations);
  const workingStations = stations.filter(s => s.nws.success || s.openweather.success);
  
  workingStations.forEach(s => {
    const nwsTemp = s.nws.success ? s.nws.data.temperature : 'N/A';
    const owTemp = s.openweather.success ? s.openweather.data.temperature : 'N/A';
    console.log(`📍 ${s.station.name}: NWS=${nwsTemp}°F, OW=${owTemp}°F (${s.station.distance_miles.toFixed(1)}mi away)`);
  });
  
  return results;
}

fullAPITest().catch(console.error);