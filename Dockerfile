# Emerald Hills Weather Dashboard - Production Dockerfile
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/
COPY data/ ./data/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S weather -u 1001 -G nodejs

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R weather:nodejs /app/data

# Switch to non-root user
USER weather

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "src/api/server.js"]