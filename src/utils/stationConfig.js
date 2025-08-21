// Weather station configuration for SF Peninsula correlation analysis
// Target: 363 Lakeview Way, Emerald Hills, CA (37.4419°N, 122.2708°W, 440 ft)

const WEATHER_STATIONS = {
  target: {
    name: 'Emerald Hills',
    lat: 37.4419,
    lon: -122.2708,
    elevation: 440,
    code: 'TARGET'
  },
  
  // Primary correlation candidates
  san_jose: {
    name: 'San Jose (KSJC)',
    lat: 37.3626,
    lon: -121.9294,
    elevation: 62,
    code: 'KSJC',
    icao: 'KSJC',
    expected_correlation: 'high_on_hot_days',
    notes: 'Inland, similar heat patterns, likely best correlation for hot weather'
  },
  
  redwood_city: {
    name: 'Redwood City',
    lat: 37.4849,
    lon: -122.2364,
    elevation: 7,
    code: 'KRWC',
    icao: 'KRWC', 
    expected_correlation: 'moderate',
    notes: 'Closest station but marine layer influenced'
  },
  
  palo_alto: {
    name: 'Palo Alto (KPAO)',
    lat: 37.4611,
    lon: -122.1150,
    elevation: 4,
    code: 'KPAO',
    icao: 'KPAO',
    expected_correlation: 'high_inland_days',
    notes: 'Inland location with similar elevation effects'
  },
  
  // Reference stations for marine layer detection
  san_mateo: {
    name: 'San Mateo',
    lat: 37.4839,
    lon: -122.3131,
    elevation: 3,
    code: 'KSMO',
    icao: 'KSMO',
    expected_correlation: 'coastal_reference',
    notes: 'Coastal reference point for marine layer analysis'
  },
  
  half_moon_bay: {
    name: 'Half Moon Bay',
    lat: 37.5114,
    lon: -122.4778,
    elevation: 67,
    code: 'KHAF',
    icao: 'KHAF',
    expected_correlation: 'marine_layer_reference',
    notes: 'Marine layer reference point, expect low correlation but useful for pattern detection'
  }
};

// Calculate distance between two lat/lon points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all stations with distance from target
function getStationsWithDistance() {
  const target = WEATHER_STATIONS.target;
  const stations = Object.entries(WEATHER_STATIONS)
    .filter(([key]) => key !== 'target')
    .map(([key, station]) => ({
      ...station,
      key,
      distance_miles: calculateDistance(target.lat, target.lon, station.lat, station.lon)
    }))
    .sort((a, b) => a.distance_miles - b.distance_miles);
  
  return stations;
}

module.exports = {
  WEATHER_STATIONS,
  getStationsWithDistance,
  TARGET_LOCATION: WEATHER_STATIONS.target
};