# Emerald Hills Personal Weather Dashboard - PRD

## Problem Statement
**What problem are we solving?**
Standard weather forecasts for the SF Peninsula are based on sea-level stations (SFO, Redwood City, etc.) and don't accurately predict conditions at higher elevations like Emerald Hills (440 ft). During late summer/fall, hilltop areas can be 10-20°F hotter than coastal forecasts suggest due to marine layer effects.

**Who has this problem?**
Residents of inland/elevated areas on the Peninsula who need accurate local weather for daily planning (clothing, outdoor activities, etc.).

**Why does this matter now?**
Existing weather apps consistently under-predict heat in our microclimate, leading to poor daily decisions. A personalized model based on local correlation patterns would be genuinely useful.

## Success Metrics
**Primary Success Metric:**
Temperature predictions for 363 Lakeview Way are within 3°F of actual conditions 80% of the time (vs. ~60% for standard forecasts).

**Secondary Metrics:**
- Dashboard loads current conditions in under 3 seconds
- Historical accuracy tracking shows improvement over generic forecasts
- User can quickly see "feels like" temperature for their specific location
- Mobile-friendly for checking on the go

## User Stories (High Level)
- As a hilltop resident, I want to see today's temperature prediction for MY elevation so I know how to dress
- As someone who plans outdoor activities, I want to see if it will be marine layer cool or inland hot so I can plan accordingly
- As a curious person, I want to see how different nearby stations correlate with my actual conditions so I understand my microclimate
- As a data-driven person, I want to track prediction accuracy over time so I can trust the forecasts

## Scope & Constraints

### In Scope (Must Have)
- **Current conditions** for 363 Lakeview Way based on correlation model
- **Today's forecast** (high/low) adjusted for elevation and marine layer effects
- **Station correlation display** showing which nearby stations best predict local conditions
- **Simple accuracy tracking** to validate the model is working

### Out of Scope (Not Building)
- Extended 7-day forecasts (too complex for v1)
- Precipitation prediction (focus on temperature first)
- Multiple locations (just Emerald Hills for now)
- Historical weather data storage (use APIs)

### Technical Constraints
- **Performance**: Dashboard must load in under 3 seconds
- **Data**: Must use free weather APIs (OpenWeatherMap, NWS, etc.)
- **Accuracy**: Need at least 3-4 nearby stations for correlation analysis
- **Updates**: Refresh data every 30 minutes max (API rate limits)

## Dependencies & Assumptions

### External Dependencies
- **OpenWeatherMap API** for current conditions and forecasts
- **National Weather Service API** for additional station data
- **Historical weather data** to build correlation models
- **Reliable internet** for API calls

### Key Assumptions
- **Correlation patterns are stable** (San Jose similarity holds over time)
- **Elevation adjustment** can be approximated with lapse rate calculations
- **Marine layer effects** can be detected from coastal vs. inland station differences
- **Free APIs provide sufficient data** for building correlation models

### Weather Stations to Include
- **San Jose (KSJC)** - likely best correlation for hot days
- **Redwood City** - closest station but marine layer influenced
- **San Carlos** - nearby but lower elevation
- **Palo Alto (KPAO)** - inland but similar elevation effects
- **San Mateo** - coastal reference point
- **Half Moon Bay** - marine layer reference

## Definition of Success
**How will we know this is working?**
- Dashboard shows meaningfully different predictions than generic SF Bay forecasts
- Temperature predictions track closer to actual conditions than standard forecasts
- User can quickly understand why today will be different from coastal predictions

**What would make us stop/pivot?**
- Correlation analysis shows no meaningful patterns (all stations equally inaccurate)
- API costs or rate limits make real-time updates impossible
- Technical complexity exceeds development capacity

## Technical Approach Preview
1. **Collect data** from 5-6 nearby weather stations
2. **Build correlation model** comparing station readings to actual Emerald Hills conditions
3. **Apply elevation adjustments** using atmospheric lapse rate
4. **Detect marine layer days** using coastal vs. inland temperature differentials
5. **Generate personalized forecast** weighted by historical correlation patterns