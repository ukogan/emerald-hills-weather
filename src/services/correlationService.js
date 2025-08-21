// Correlation-based weather prediction service for Emerald Hills
// Implements weighted station correlation and elevation adjustments

const WeatherAPIService = require('./weatherAPI');
const { getStationsWithDistance, TARGET_LOCATION } = require('../utils/stationConfig');

class CorrelationService {
  constructor() {
    this.weatherService = new WeatherAPIService();
    this.elevationAdjustment = 1.5; // +1.5°F for 440ft elevation (standard atmospheric lapse rate)
    
    // Station correlation weights based on observed patterns and proximity
    // These weights are based on the documented microclimate analysis
    this.stationWeights = {
      'san_jose': 0.35,     // High correlation for inland hot days
      'palo_alto': 0.30,    // Good inland correlation, similar elevation effects
      'redwood_city': 0.25, // Closest geographically but marine layer influence
      'san_mateo': 0.10,    // Coastal reference for marine layer detection
      'half_moon_bay': 0.0  // Pure marine layer reference, low correlation
    };
  }

  // Calculate weighted temperature prediction based on station correlations
  async calculateCorrelatedTemperature(stationData) {
    let weightedSum = 0;
    let totalWeight = 0;
    const predictions = {};

    // Apply weights to each station's temperature reading
    for (const [stationKey, data] of Object.entries(stationData)) {
      const weight = this.stationWeights[stationKey] || 0;
      
      if (weight > 0 && data.openweather && data.openweather.success) {
        const stationTemp = data.openweather.data.temperature;
        const weightedTemp = stationTemp * weight;
        
        weightedSum += weightedTemp;
        totalWeight += weight;
        
        predictions[stationKey] = {
          temperature: stationTemp,
          weight: weight,
          contribution: weightedTemp
        };
      }
    }

    if (totalWeight === 0) {
      throw new Error('No valid station data available for correlation analysis');
    }

    // Calculate base prediction from weighted average
    const basePrediction = weightedSum / totalWeight;
    
    // Apply elevation adjustment (+1.5°F for 440ft elevation)
    const elevationAdjustedTemp = basePrediction + this.elevationAdjustment;

    return {
      basePrediction,
      elevationAdjustedTemp,
      totalWeight,
      predictions,
      elevationAdjustment: this.elevationAdjustment
    };
  }

  // Detect marine layer conditions based on coastal vs inland temperature differential
  detectMarineLayer(stationData) {
    const coastalStations = ['san_mateo', 'half_moon_bay'];
    const inlandStations = ['san_jose', 'palo_alto'];
    
    let coastalTemp = null;
    let inlandTemp = null;

    // Get average coastal temperature
    const coastalTemps = coastalStations.map(station => {
      if (stationData[station] && stationData[station].openweather && stationData[station].openweather.success) {
        return stationData[station].openweather.data.temperature;
      }
      return null;
    }).filter(temp => temp !== null);

    if (coastalTemps.length > 0) {
      coastalTemp = coastalTemps.reduce((sum, temp) => sum + temp, 0) / coastalTemps.length;
    }

    // Get average inland temperature
    const inlandTemps = inlandStations.map(station => {
      if (stationData[station] && stationData[station].openweather && stationData[station].openweather.success) {
        return stationData[station].openweather.data.temperature;
      }
      return null;
    }).filter(temp => temp !== null);

    if (inlandTemps.length > 0) {
      inlandTemp = inlandTemps.reduce((sum, temp) => sum + temp, 0) / inlandTemps.length;
    }

    // Detect marine layer if coastal is significantly cooler than inland
    const tempDifference = inlandTemp && coastalTemp ? inlandTemp - coastalTemp : 0;
    const marineLayerDetected = tempDifference > 8; // 8°F+ difference indicates marine layer

    return {
      detected: marineLayerDetected,
      coastalTemp,
      inlandTemp,
      tempDifference,
      confidence: tempDifference > 12 ? 'high' : tempDifference > 8 ? 'moderate' : 'low'
    };
  }

  // Calculate prediction confidence based on data quality and patterns
  calculateConfidence(stationData, marineLayerInfo) {
    let confidence = 0.5; // Base confidence
    let factors = [];

    // Factor 1: Number of successful station readings
    const successfulStations = Object.values(stationData).filter(data => 
      data.openweather && data.openweather.success
    ).length;
    
    if (successfulStations >= 4) {
      confidence += 0.3;
      factors.push('high_station_coverage');
    } else if (successfulStations >= 2) {
      confidence += 0.15;
      factors.push('moderate_station_coverage');
    }

    // Factor 2: Marine layer pattern clarity
    if (marineLayerInfo.confidence === 'high') {
      confidence += 0.15;
      factors.push('clear_marine_layer_pattern');
    } else if (marineLayerInfo.confidence === 'moderate') {
      confidence += 0.05;
      factors.push('moderate_marine_layer_pattern');
    }

    // Factor 3: Key station availability (San Jose and Palo Alto are most important)
    const keyStationsWorking = ['san_jose', 'palo_alto'].filter(station => 
      stationData[station] && stationData[station].openweather && stationData[station].openweather.success
    ).length;

    if (keyStationsWorking === 2) {
      confidence += 0.1;
      factors.push('key_stations_available');
    }

    // Cap confidence at 0.95
    confidence = Math.min(0.95, confidence);

    return {
      score: confidence,
      level: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'moderate' : 'low',
      factors
    };
  }

  // Generate forecast for Emerald Hills using correlation analysis
  async generateEmeraldHillsForecast() {
    try {
      // Get current conditions from all stations
      const stations = getStationsWithDistance();
      const stationData = {};
      
      // Collect data from all available stations
      for (const station of stations) {
        try {
          const owResult = await this.weatherService.getOpenWeatherCurrent(station.lat, station.lon);
          stationData[station.key] = {
            station: station,
            openweather: owResult
          };
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Failed to get data for ${station.name}:`, error.message);
          stationData[station.key] = {
            station: station,
            openweather: { success: false, error: error.message }
          };
        }
      }

      // Perform correlation analysis
      const temperaturePrediction = await this.calculateCorrelatedTemperature(stationData);
      const marineLayerInfo = this.detectMarineLayer(stationData);
      const confidence = this.calculateConfidence(stationData, marineLayerInfo);

      // Get target location current conditions for comparison
      const targetCurrent = await this.weatherService.getOpenWeatherCurrent(
        TARGET_LOCATION.lat, 
        TARGET_LOCATION.lon
      );

      return {
        success: true,
        location: TARGET_LOCATION,
        forecast: {
          temperature: Math.round(temperaturePrediction.elevationAdjustedTemp * 10) / 10,
          basePrediction: Math.round(temperaturePrediction.basePrediction * 10) / 10,
          elevationAdjustment: temperaturePrediction.elevationAdjustment,
          confidence: confidence
        },
        analysis: {
          marineLayer: marineLayerInfo,
          stationContributions: temperaturePrediction.predictions,
          totalWeight: temperaturePrediction.totalWeight
        },
        comparison: {
          targetCurrent: targetCurrent.success ? targetCurrent.data.temperature : null,
          predictionAccuracy: targetCurrent.success ? 
            Math.abs(temperaturePrediction.elevationAdjustedTemp - targetCurrent.data.temperature) : null
        },
        stationData,
        timestamp: new Date().toISOString(),
        method: 'correlation_weighted_with_elevation'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = CorrelationService;