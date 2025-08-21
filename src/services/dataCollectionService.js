// Automated weather data collection service
// Collects data from multiple weather stations on schedule for correlation analysis

const WeatherAPIService = require('./weatherAPI');
const WeatherDataManager = require('../models/weatherData');
const { getStationsWithDistance } = require('../utils/stationConfig');

// Simple UUID v4 implementation
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class DataCollectionService {
  constructor() {
    this.weatherAPI = new WeatherAPIService();
    this.dataManager = new WeatherDataManager();
    this.isRunning = false;
    this.collectionInterval = null;
    this.collectionIntervalMinutes = 30; // Collect every 30 minutes
    this.lastCollection = null;
  }

  // Start automated data collection
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Data collection service is already running');
      return;
    }

    console.log(`🚀 Starting automated data collection every ${this.collectionIntervalMinutes} minutes...`);
    
    try {
      // Initialize database
      await this.dataManager.db.initialize();
      await this.dataManager.db.initializeStations();

      // Run initial collection
      await this.collectAllStations();

      // Schedule regular collections
      this.collectionInterval = setInterval(() => {
        this.collectAllStations().catch(error => {
          console.error('❌ Scheduled collection failed:', error);
        });
      }, this.collectionIntervalMinutes * 60 * 1000);

      this.isRunning = true;
      console.log('✅ Data collection service started successfully');
    } catch (error) {
      console.error('❌ Failed to start data collection service:', error);
      throw error;
    }
  }

  // Stop automated data collection
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Data collection service is not running');
      return;
    }

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    this.isRunning = false;
    console.log('🛑 Data collection service stopped');
  }

  // Collect data from all active stations
  async collectAllStations() {
    const collectionRunId = uuidv4();
    const startTime = Date.now();
    
    console.log(`📊 Starting collection run ${collectionRunId.slice(0, 8)}...`);

    try {
      const stations = getStationsWithDistance();
      const results = {
        runId: collectionRunId,
        startTime: new Date().toISOString(),
        stations: {},
        summary: {
          total: stations.length,
          successful: 0,
          failed: 0,
          recordsCollected: 0,
          apiCallsMade: 0
        }
      };

      // Collect from each station with rate limiting
      for (const station of stations) {
        const stationResult = await this.collectStation(station, collectionRunId);
        results.stations[station.key] = stationResult;

        if (stationResult.success) {
          results.summary.successful++;
          results.summary.recordsCollected += stationResult.recordsCollected;
        } else {
          results.summary.failed++;
        }
        
        results.summary.apiCallsMade += stationResult.apiCalls;

        // Rate limiting: wait between stations to respect API limits
        await this.delay(1000); // 1 second between stations
      }

      const duration = Date.now() - startTime;
      results.duration = duration;
      results.endTime = new Date().toISOString();

      console.log(`✅ Collection run completed: ${results.summary.successful}/${results.summary.total} stations successful, ${results.summary.recordsCollected} records collected in ${duration}ms`);

      this.lastCollection = results;
      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Collection run ${collectionRunId.slice(0, 8)} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  // Collect data from a single station
  async collectStation(station, collectionRunId) {
    const startTime = Date.now();
    const result = {
      station: station.key,
      success: false,
      recordsCollected: 0,
      apiCalls: 0,
      errors: []
    };

    try {
      console.log(`  📡 Collecting data for ${station.name}...`);

      // Collect from OpenWeather
      const owResult = await this.collectFromSource(station, 'openweather', collectionRunId);
      result.apiCalls += owResult.apiCalls;
      if (owResult.success) {
        result.recordsCollected += owResult.recordsCollected;
      } else {
        result.errors.push(owResult.error);
      }

      // Small delay between API calls
      await this.delay(500);

      // Collect from NWS
      const nwsResult = await this.collectFromSource(station, 'nws', collectionRunId);
      result.apiCalls += nwsResult.apiCalls;
      if (nwsResult.success) {
        result.recordsCollected += nwsResult.recordsCollected;
      } else {
        result.errors.push(nwsResult.error);
      }

      // Consider success if at least one source worked
      result.success = result.recordsCollected > 0;

      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`    ✅ ${station.name}: ${result.recordsCollected} records, ${result.apiCalls} API calls (${duration}ms)`);
      } else {
        console.log(`    ❌ ${station.name}: No data collected (${duration}ms)`);
      }

      return result;

    } catch (error) {
      result.errors.push(error.message);
      console.error(`    ❌ ${station.name} collection failed:`, error.message);
      return result;
    }
  }

  // Collect data from a specific API source
  async collectFromSource(station, source, collectionRunId) {
    const startTime = Date.now();
    const result = {
      success: false,
      recordsCollected: 0,
      apiCalls: 0,
      error: null
    };

    try {
      let apiResult = null;

      // Call appropriate API
      if (source === 'openweather') {
        apiResult = await this.weatherAPI.getOpenWeatherCurrent(station.lat, station.lon);
        result.apiCalls = 1;
      } else if (source === 'nws') {
        apiResult = await this.weatherAPI.getNWSCurrent(station.lat, station.lon);
        result.apiCalls = 1; // NWS makes multiple internal calls but we count as 1
      } else {
        throw new Error(`Unknown source: ${source}`);
      }

      if (apiResult.success && apiResult.data) {
        // Store the reading
        const readingData = {
          temperature: apiResult.data.temperature,
          feels_like: apiResult.data.feels_like,
          humidity: apiResult.data.humidity,
          pressure: apiResult.data.pressure,
          wind_speed: apiResult.data.wind_speed || null,
          wind_direction: apiResult.data.wind_direction || null,
          conditions: apiResult.data.conditions,
          visibility: apiResult.data.visibility || null,
          raw: apiResult.raw || apiResult
        };

        await this.dataManager.storeReading(
          station.key,
          source,
          readingData,
          apiResult.data.timestamp || new Date().toISOString()
        );

        result.success = true;
        result.recordsCollected = 1;

        // Log successful collection
        await this.dataManager.logCollection(
          collectionRunId,
          station.key,
          source,
          true,
          null,
          1,
          result.apiCalls,
          Date.now() - startTime
        );

      } else {
        result.error = apiResult.error || 'No data returned';
        
        // Log failed collection
        await this.dataManager.logCollection(
          collectionRunId,
          station.key,
          source,
          false,
          result.error,
          0,
          result.apiCalls,
          Date.now() - startTime
        );
      }

    } catch (error) {
      result.error = error.message;
      
      // Log failed collection
      await this.dataManager.logCollection(
        collectionRunId,
        station.key,
        source,
        false,
        result.error,
        0,
        result.apiCalls,
        Date.now() - startTime
      );
    }

    return result;
  }

  // Manual collection trigger
  async collectNow() {
    if (this.isRunning) {
      console.log('🔄 Triggering manual collection...');
      return await this.collectAllStations();
    } else {
      throw new Error('Data collection service is not running. Start it first.');
    }
  }

  // Get service status
  getStatus() {
    return {
      running: this.isRunning,
      intervalMinutes: this.collectionIntervalMinutes,
      lastCollection: this.lastCollection,
      nextCollection: this.isRunning && this.lastCollection ? 
        new Date(new Date(this.lastCollection.startTime).getTime() + this.collectionIntervalMinutes * 60 * 1000).toISOString() : 
        null
    };
  }

  // Get collection statistics
  async getStats(hours = 24) {
    return await this.dataManager.getCollectionStats(hours);
  }

  // Get recent readings for analysis
  async getRecentReadings(stationKey = null, hours = 24) {
    if (stationKey) {
      return await this.dataManager.getRecentReadings(stationKey, hours);
    } else {
      return await this.dataManager.getLatestReadings();
    }
  }

  // Utility: delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean old data (run periodically)
  async cleanOldData(daysToKeep = 30) {
    console.log(`🧹 Cleaning data older than ${daysToKeep} days...`);
    return await this.dataManager.cleanOldData(daysToKeep);
  }
}

module.exports = DataCollectionService;