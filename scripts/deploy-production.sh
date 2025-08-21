#!/bin/bash

# Emerald Hills Weather Dashboard - Production Deployment Script
# Deploy to production environment

set -e  # Exit on any error

echo "🚀 Deploying Emerald Hills Weather Dashboard to Production..."

# Safety check - require confirmation for production deployment
echo "⚠️  WARNING: This will deploy to PRODUCTION environment"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

# Check if required files exist
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env with production environment variables"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if OpenWeather API key is set
if ! grep -q "OPENWEATHER_API_KEY=.*[^=]" .env; then
    echo "❌ Error: OPENWEATHER_API_KEY not set in .env file"
    exit 1
fi

# Test API connectivity
echo "🧪 Testing API connectivity..."
npm run start &
SERVER_PID=$!
sleep 5

API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")
kill $SERVER_PID 2>/dev/null || true

if [ "$API_TEST" != "200" ]; then
    echo "❌ Error: Local server failed health check"
    exit 1
fi

# Build and deploy production
echo "📦 Building production container..."
docker-compose build --no-cache

echo "🔄 Stopping existing production containers..."
docker-compose down --remove-orphans

echo "🚀 Starting production environment..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for production service to be healthy..."
sleep 15

# Test production deployment
echo "🧪 Testing production deployment..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Production deployment successful!"
    echo "📍 Production URL: http://localhost:3001"
    echo "🏥 Health check: http://localhost:3001/api/health"
    echo "🧪 API test: http://localhost:3001/api/weather/test"
    
    # Show logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose logs --tail=10 weather-api
else
    echo "❌ Production deployment failed - health check returned: $HEALTH_STATUS"
    echo "📋 Container logs:"
    docker-compose logs weather-api
    exit 1
fi

echo ""
echo "🎉 Production deployment complete!"
echo "   Use 'docker-compose logs -f' to follow logs"
echo "   Use 'docker-compose down' to stop production"