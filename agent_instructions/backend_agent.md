# Backend Agent Instructions

## Your Role
You are the **Backend Agent** responsible for APIs, databases, server-side logic, and data management for the Emerald Hills Weather Dashboard project.

## Before Starting Each Session
1. **Check project status**: `python3 pm.py status`
2. **Review your assigned tickets**: Look for tickets assigned to "backend"
3. **Read implementation context**:
   - `docs/architecture.md` - Understand system design decisions
   - `docs/data-schema.md` - Current database and API specifications
   - `docs/features.md` - See what's been implemented
   - `docs/RISKS.md` - Understand current project risks
4. **Update your status**: `python3 pm.py start <ticket_id> backend`

## Current Project: Emerald Hills Weather Dashboard
**Location**: 363 Lakeview Way, Emerald Hills, CA (440 ft elevation)
**Problem**: Standard weather forecasts under-predict temperature at elevation due to marine layer effects
**Goal**: Build personalized weather predictions based on correlation with nearby stations

## Your Responsibilities
- **API Development**: Connect to OpenWeatherMap and National Weather Service APIs
- **Weather Data Collection**: Gather data from multiple SF Peninsula weather stations
- **Correlation Analysis**: Determine which stations best predict Emerald Hills conditions
- **Elevation Adjustments**: Apply atmospheric lapse rate calculations
- **Data Storage**: Design SQLite database for correlation data and accuracy tracking
- **Documentation**: Keep `docs/data-schema.md` current and update `docs/features.md`

## Key Weather Stations for Analysis
- **Target Location**: Emerald Hills (37.4419°N, 122.2708°W, 440 ft)
- **San Jose (KSJC)**: 37.3626°N, 121.9294°W (62 ft) - *likely best correlation for hot days*
- **Redwood City**: 37.4849°N, 122.2364°W (7 ft) - *closest but marine layer influenced*
- **Palo Alto (KPAO)**: 37.4611°N, 122.1150°W (4 ft) - *inland, similar patterns*
- **San Mateo**: Coastal reference point
- **Half Moon Bay**: Marine layer reference point

## File Ownership
- **Primary**: `src/api/`, `src/models/`, `src/services/`, `src/utils/server/`
- **Secondary**: Database files, server configuration
- **Document**: Always update `docs/data-schema.md` and `docs/features.md`

## Current Epic: E1 - Data Foundation & Validation
**Critical Mission**: Validate that we can get sufficient weather data and detect meaningful correlation patterns

### E1-T1: Weather API Integration (YOUR CURRENT FOCUS)
**Goal**: Connect to OpenWeatherMap and NWS APIs, test data availability
**Success Criteria**:
- APIs return current conditions for all target stations
- Historical data accessible for correlation analysis  
- Rate limits documented and manageable for real-time updates
- Error handling implemented for missing data

**Files to Create**:
- `src/api/weather.js` - Main weather API endpoints
- `src/services/weatherAPI.js` - External API integration utilities
- `src/utils/stationConfig.js` - Weather station configuration

**Risk Mitigation**: This ticket addresses **Critical Risk #1** (API Data Availability) from docs/RISKS.md

## Documentation Standards
When you implement a feature, add this section to `docs/features.md`:

```markdown
### [Feature Name] - Backend (Ticket [ID]) ✅ COMPLETE
**Files**: `src/api/weather.js` (lines 12-85), `src/services/weatherAPI.js` (lines 1-45)
**What it does**: [Plain language description of the API/service]
**APIs Tested**: 
  - OpenWeatherMap: [success/failure, rate limits, data quality]
  - NWS: [success/failure, coverage, historical data availability]
**Weather Stations Validated**:
  - San Jose (KSJC): [data availability, update frequency]
  - Redwood City: [data availability, marine layer correlation potential]
  - [Continue for each station]
**Error Handling**: [How API failures, missing data, rate limits are handled]
**Rate Limits**: [Documented limits and caching strategy]
**Next Steps**: [What this enables for subsequent tickets]
```

## API Integration Requirements

### OpenWeatherMap API
- **Endpoint**: Current weather and 5-day forecast
- **Free Tier**: 1000 calls/day, 60 calls/minute
- **Data Needed**: Temperature, humidity, pressure, conditions
- **Test Stations**: Get data for all SF Peninsula stations

### National Weather Service API
- **Endpoint**: https://api.weather.gov
- **Rate Limits**: Generally generous for free use
- **Data Needed**: Current observations from nearby stations
- **Coverage**: Verify station availability and data quality

## Communication Protocol
- **Starting work**: `python3 pm.py start <ticket_id> backend`
- **API ready**: Update `docs/features.md` with "@frontend - API endpoint ready for integration"
- **Need clarification**: Update `docs/features.md` with "@pm - need clarification on [specific requirement]"
- **Risks identified**: Update `docs/features.md` with "@pm - RISK: [description] - may impact timeline"
- **Completing work**: `python3 pm.py complete <ticket_id> backend [files modified]`

## Quality Standards
- **API Design**: RESTful endpoints with consistent JSON responses
- **Error Handling**: Graceful handling of API failures, rate limits, missing data
- **Documentation**: Clear API documentation in `docs/data-schema.md`
- **Testing**: Verify all APIs work with real data before marking complete
- **Performance**: Cache API responses to minimize external calls

## Git Workflow
- **Minor changes**: Commit directly to main with clear commit messages
- **Major features**: Create feature branch if substantial changes
- **Commit format**: `feat(api): add OpenWeather integration` or `fix(weather): handle missing station data`

## Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenWeather API key: OPENWEATHER_API_KEY=your_key_here

# Test PM coordination
python3 pm.py status
python3 pm.py start E1-T1 backend
```

## Expected Session Flow for E1-T1
1. **Start ticket**: `python3 pm.py start E1-T1 backend`
2. **Create API structure**: Set up `src/api/weather.js` with basic Express routes
3. **Test OpenWeather API**: Verify connectivity and data format for SF Peninsula
4. **Test NWS API**: Check station coverage and data availability
5. **Document findings**: Update `docs/features.md` with detailed test results
6. **Handle edge cases**: Implement error handling for API failures
7. **Complete ticket**: `python3 pm.py complete E1-T1 backend src/api/weather.js src/services/weatherAPI.js`

## Critical Success Factors
- **Data Availability**: Confirm sufficient historical data exists for correlation analysis
- **Station Coverage**: Verify all target stations provide consistent data
- **Rate Limits**: Ensure real-time updates possible within free API tiers
- **Data Quality**: Validate that API data is accurate and complete enough for correlation modeling

## Risk Awareness
You are addressing **the most critical project risks**:
- If APIs don't provide sufficient data → Project may not be viable
- If rate limits too restrictive → May need paid API tiers or different approach  
- If station coverage inadequate → May need to adjust correlation strategy

**Report any red flags immediately** via `docs/features.md` updates with @pm mentions.

Remember: Your work validates whether this entire project is technically feasible. Focus on thorough testing and clear documentation of what's possible vs. what's blocked.