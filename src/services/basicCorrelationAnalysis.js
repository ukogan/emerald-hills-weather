// Basic correlation analysis service for E1-T3
// Analyzes which nearby stations best predict conditions at Emerald Hills

const WeatherDataManager = require('../models/weatherData');
const WeatherAPIService = require('./weatherAPI');
const { getStationsWithDistance, TARGET_LOCATION } = require('../utils/stationConfig');

class BasicCorrelationAnalysis {
  constructor() {
    this.dataManager = new WeatherDataManager();
    this.weatherService = new WeatherAPIService();
    this.targetLocation = TARGET_LOCATION;
  }

  // Calculate Pearson correlation coefficient between two data arrays
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) {
      return null;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) {
      return null;
    }

    return numerator / denominator;
  }

  // Get current temperature data for all stations
  async getCurrentTemperatureData() {
    const stations = getStationsWithDistance();
    const currentData = {};

    // Get current target location temperature
    const targetResult = await this.weatherService.getOpenWeatherCurrent(
      this.targetLocation.lat, 
      this.targetLocation.lon
    );

    if (targetResult.success) {
      currentData.target = {
        temperature: targetResult.data.temperature,
        timestamp: new Date().toISOString(),
        location: this.targetLocation
      };
    }

    // Get current data for each station
    for (const station of stations) {
      try {
        const stationResult = await this.weatherService.getOpenWeatherCurrent(
          station.lat, 
          station.lon
        );

        if (stationResult.success) {
          currentData[station.key] = {
            temperature: stationResult.data.temperature,
            humidity: stationResult.data.humidity,
            pressure: stationResult.data.pressure,
            timestamp: new Date().toISOString(),
            station: station
          };
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`Failed to get current data for ${station.name}:`, error.message);
      }
    }

    return currentData;
  }

  // Analyze correlation patterns using current temperature data
  async analyzeCurrentCorrelations() {
    try {
      const currentData = await this.getCurrentTemperatureData();
      
      if (!currentData.target) {
        throw new Error('Unable to get target location temperature data');
      }

      const targetTemp = currentData.target.temperature;
      const stationAnalysis = {};
      const stations = getStationsWithDistance();

      // Analyze each station's correlation with target
      for (const station of stations) {
        const stationKey = station.key;
        
        if (currentData[stationKey]) {
          const stationTemp = currentData[stationKey].temperature;
          const tempDifference = Math.abs(targetTemp - stationTemp);
          
          // Simple correlation score based on temperature similarity
          // Closer temperatures = higher correlation score
          const correlationScore = Math.max(0, 1 - (tempDifference / 20)); // Normalize by 20°F range
          
          stationAnalysis[stationKey] = {
            station: station,
            currentTemperature: stationTemp,
            targetTemperature: targetTemp,
            temperatureDifference: tempDifference,
            correlationScore: correlationScore,
            notes: this.getCorrelationNotes(correlationScore, tempDifference, station)
          };
        }
      }

      // Rank stations by correlation score
      const rankedStations = Object.entries(stationAnalysis)
        .sort(([,a], [,b]) => b.correlationScore - a.correlationScore)
        .map(([key, data], index) => ({
          rank: index + 1,
          stationKey: key,
          ...data
        }));

      // Detect marine layer conditions
      const marineLayerAnalysis = this.detectMarineLayerPattern(currentData);

      return {
        success: true,
        analysisTimestamp: new Date().toISOString(),
        targetLocation: this.targetLocation,
        targetTemperature: targetTemp,
        totalStations: rankedStations.length,
        correlationAnalysis: rankedStations,
        marineLayerPattern: marineLayerAnalysis,
        summary: this.generateCorrelationSummary(rankedStations, marineLayerAnalysis),
        method: 'current_temperature_correlation'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Detect marine layer patterns in current data
  detectMarineLayerPattern(currentData) {
    const coastalStations = ['san_mateo', 'half_moon_bay'];
    const inlandStations = ['san_jose', 'palo_alto'];
    
    let coastalTemps = [];
    let inlandTemps = [];

    coastalStations.forEach(station => {
      if (currentData[station]) {
        coastalTemps.push(currentData[station].temperature);
      }
    });

    inlandStations.forEach(station => {
      if (currentData[station]) {
        inlandTemps.push(currentData[station].temperature);
      }
    });

    if (coastalTemps.length === 0 || inlandTemps.length === 0) {
      return { detected: false, reason: 'insufficient_data' };
    }

    const avgCoastal = coastalTemps.reduce((a, b) => a + b) / coastalTemps.length;
    const avgInland = inlandTemps.reduce((a, b) => a + b) / inlandTemps.length;
    const tempDifference = avgInland - avgCoastal;

    return {
      detected: tempDifference > 8, // 8°F+ difference indicates marine layer
      coastalAvg: Math.round(avgCoastal * 10) / 10,
      inlandAvg: Math.round(avgInland * 10) / 10,
      tempDifference: Math.round(tempDifference * 10) / 10,
      confidence: tempDifference > 12 ? 'high' : tempDifference > 8 ? 'moderate' : 'low',
      interpretation: tempDifference > 8 ? 
        'Marine layer likely keeping coastal areas cooler' : 
        'No significant marine layer effect detected'
    };
  }

  // Generate correlation notes based on analysis
  getCorrelationNotes(score, tempDiff, station) {
    const notes = [];
    
    if (score > 0.8) {
      notes.push('Excellent correlation - very similar temperature');
    } else if (score > 0.6) {
      notes.push('Good correlation - moderately similar temperature');
    } else if (score > 0.4) {
      notes.push('Fair correlation - some temperature difference');
    } else {
      notes.push('Poor correlation - significant temperature difference');
    }

    if (tempDiff < 2) {
      notes.push('Minimal temperature difference');
    } else if (tempDiff < 5) {
      notes.push('Moderate temperature difference');
    } else {
      notes.push('Significant temperature difference');
    }

    // Add station-specific notes
    if (station.expected_correlation) {
      notes.push(`Expected: ${station.expected_correlation}`);
    }

    return notes;
  }

  // Generate summary of correlation findings
  generateCorrelationSummary(rankedStations, marineLayerAnalysis) {
    const summary = {
      bestCorrelation: rankedStations[0],
      worstCorrelation: rankedStations[rankedStations.length - 1],
      averageCorrelation: rankedStations.reduce((sum, station) => 
        sum + station.correlationScore, 0) / rankedStations.length,
      findings: []
    };

    // Generate findings
    summary.findings.push(
      `Best correlation: ${summary.bestCorrelation.station.name} (score: ${summary.bestCorrelation.correlationScore.toFixed(3)})`
    );

    if (marineLayerAnalysis.detected) {
      summary.findings.push(
        `Marine layer detected: ${marineLayerAnalysis.tempDifference}°F coastal/inland difference`
      );
    }

    // Validate hypothesis: San Jose should correlate better than coastal stations during hot days
    const sanJose = rankedStations.find(s => s.stationKey === 'san_jose');
    const coastalStations = rankedStations.filter(s => 
      ['san_mateo', 'half_moon_bay'].includes(s.stationKey)
    );

    if (sanJose && coastalStations.length > 0) {
      const avgCoastalScore = coastalStations.reduce((sum, s) => sum + s.correlationScore, 0) / coastalStations.length;
      const hypothesisValidated = sanJose.correlationScore > avgCoastalScore;
      
      summary.findings.push(
        `Hypothesis validation: San Jose vs coastal stations - ${hypothesisValidated ? 'CONFIRMED' : 'NOT CONFIRMED'} ` +
        `(${sanJose.correlationScore.toFixed(3)} vs ${avgCoastalScore.toFixed(3)})`
      );
    }

    return summary;
  }

  // Test the correlation analysis hypothesis for E1-T3
  async testCorrelationHypothesis() {
    const analysis = await this.analyzeCurrentCorrelations();
    
    if (!analysis.success) {
      return analysis;
    }

    // Focus on hypothesis: "San Jose (KSJC) will correlate better than coastal stations during hot summer/fall days"
    const sanJose = analysis.correlationAnalysis.find(s => s.stationKey === 'san_jose');
    const coastalStations = analysis.correlationAnalysis.filter(s => 
      ['san_mateo', 'half_moon_bay'].includes(s.stationKey)
    );

    const hypothesis = {
      statement: "San Jose (KSJC) will correlate better than coastal stations during hot days",
      testConditions: {
        targetTemp: analysis.targetTemperature,
        isHotDay: analysis.targetTemperature > 75, // Consider 75°F+ as hot
        marineLayerDetected: analysis.marineLayerPattern.detected
      },
      results: {
        sanJoseScore: sanJose ? sanJose.correlationScore : null,
        coastalScores: coastalStations.map(s => ({
          station: s.station.name,
          score: s.correlationScore
        })),
        avgCoastalScore: coastalStations.length > 0 ? 
          coastalStations.reduce((sum, s) => sum + s.correlationScore, 0) / coastalStations.length : null
      }
    };

    hypothesis.validated = hypothesis.results.sanJoseScore && hypothesis.results.avgCoastalScore && 
      hypothesis.results.sanJoseScore > hypothesis.results.avgCoastalScore;

    return {
      ...analysis,
      hypothesisTest: hypothesis
    };
  }
}

module.exports = BasicCorrelationAnalysis;