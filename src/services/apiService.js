// API service for Emerald Hills Weather Dashboard
// Centralizes all API calls with robust error handling and retry logic

const API_BASE = '/api/weather';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const FORECAST_TIMEOUT = 15000; // 15 seconds for forecast

class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

const createAPICall = (endpoint, timeout = DEFAULT_TIMEOUT) => {
  return async (signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Use provided signal or create new one
    const requestSignal = signal || controller.signal;
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        signal: requestSignal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}`, 
          response.status, 
          endpoint
        );
      }
      
      const data = await response.json();
      
      // Check if API returned an error in the response body
      if (data.success === false) {
        throw new APIError(
          data.error || 'API returned error', 
          response.status, 
          endpoint
        );
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new APIError(
          'Request timed out', 
          408, 
          endpoint
        );
      }
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        error.message || 'Network error', 
        0, 
        endpoint
      );
    }
  };
};

// API endpoint functions
export const getCurrentConditions = createAPICall('/current');
export const getStations = createAPICall('/stations');
export const getForecast = createAPICall('/forecast', FORECAST_TIMEOUT);

// Retry wrapper with exponential backoff
export const withRetry = (apiCall, maxRetries = 3) => {
  return async (signal) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(signal);
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.status === 404 || error.status === 401 || error.status === 403) {
          throw error;
        }
        
        // Don't retry if this is the last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Don't retry if request was aborted
        if (error.status === 408 && signal?.aborted) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Cap at 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

// Batch API calls with error isolation
export const batchAPICalls = async (calls, signal) => {
  const results = {};
  const errors = {};
  
  await Promise.allSettled(
    Object.entries(calls).map(async ([key, apiCall]) => {
      try {
        results[key] = await apiCall(signal);
      } catch (error) {
        errors[key] = error;
        console.error(`API call failed for ${key}:`, error);
      }
    })
  );
  
  return { results, errors };
};

// Specialized weather data fetcher
export const fetchWeatherData = async (signal) => {
  const { results, errors } = await batchAPICalls({
    current: withRetry(getCurrentConditions, 2),
    stations: withRetry(getStations, 2)
  }, signal);
  
  // Return data even if some calls failed
  return {
    weatherData: results.current || null,
    stationsData: results.stations || null,
    errors: {
      weather: errors.current || null,
      stations: errors.stations || null
    }
  };
};

// Specialized forecast fetcher (more tolerant of failures)
export const fetchForecastData = async (signal) => {
  try {
    return await getForecast(signal);
  } catch (error) {
    // Forecast failures are non-critical
    console.warn('Forecast API not available:', error.message);
    return null;
  }
};

export default {
  getCurrentConditions,
  getStations,
  getForecast,
  withRetry,
  batchAPICalls,
  fetchWeatherData,
  fetchForecastData,
  APIError
};