// Express server for Emerald Hills Weather Dashboard API
// Provides weather data endpoints for correlation analysis

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const weatherRoutes = require('./weather');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Emerald Hills Weather API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌤️  Emerald Hills Weather API running on port ${PORT}`);
    console.log(`📍 Target: 363 Lakeview Way, Emerald Hills, CA`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 API test: http://localhost:${PORT}/api/weather/test`);
  });
}

module.exports = app;