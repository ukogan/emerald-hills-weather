# Emerald Hills Weather Dashboard

Personalized weather forecasting for SF Peninsula microclimate at 363 Lakeview Way, Emerald Hills.

## Current Status
- **Phase**: Risk Validation (Week 1)
- **Epic**: E1 - Data Foundation & Validation  
- **Risk Status**: 🔴 Red (APIs unvalidated)
- **Next**: Backend agent start E1-T1 (Weather API integration)

## Quick Start

### Backend Agent (Current Focus)
```bash
# Check current assignments
python3 pm.py status

# Start next ticket
python3 pm.py start E1-T1 backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your OpenWeather API key to .env

# Start development
npm run dev