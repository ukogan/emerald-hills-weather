#!/bin/bash

# Emerald Hills Weather Dashboard - Staging Deployment Script
# Deploy to staging environment for testing

set -e  # Exit on any error

echo "🚀 Deploying Emerald Hills Weather Dashboard to Staging..."

# Check if required files exist
if [ ! -f ".env.staging" ]; then
    echo "❌ Error: .env.staging file not found"
    echo "   Please create .env.staging with staging environment variables"
    exit 1
fi

if [ ! -f "docker-compose.staging.yml" ]; then
    echo "❌ Error: docker-compose.staging.yml not found"
    exit 1
fi

# Build and deploy staging
echo "📦 Building staging container..."
docker-compose -f docker-compose.staging.yml build --no-cache

echo "🔄 Stopping existing staging containers..."
docker-compose -f docker-compose.staging.yml down --remove-orphans

echo "🚀 Starting staging environment..."
docker-compose -f docker-compose.staging.yml up -d

# Wait for health check
echo "⏳ Waiting for staging service to be healthy..."
sleep 10

# Test staging deployment
echo "🧪 Testing staging deployment..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Staging deployment successful!"
    echo "📍 Staging URL: http://localhost:3002"
    echo "🏥 Health check: http://localhost:3002/api/health"
    echo "🧪 API test: http://localhost:3002/api/weather/test"
    
    # Show logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose -f docker-compose.staging.yml logs --tail=10 weather-api-staging
else
    echo "❌ Staging deployment failed - health check returned: $HEALTH_STATUS"
    echo "📋 Container logs:"
    docker-compose -f docker-compose.staging.yml logs weather-api-staging
    exit 1
fi

echo ""
echo "🎉 Staging deployment complete!"
echo "   Use 'docker-compose -f docker-compose.staging.yml logs -f' to follow logs"
echo "   Use 'docker-compose -f docker-compose.staging.yml down' to stop staging"