# AGENT COORDINATION - Epic 2: Core Weather Dashboard

*This file provides current assignments and coordination instructions for all agents working in parallel.*

## CURRENT STATUS
- **Epic**: E2 - Core Weather Dashboard  
- **Phase**: Parallel Development
- **Risk Status**: Yellow (APIs validated, proceeding with development)
- **Sync**: Run `../sync_agents.sh` to sync shared files between agents

---

## 🎯 BACKEND AGENT - CURRENT ASSIGNMENT

### Your Directory: `emerald-hills-weather-backend`
### Your Ticket: **E2-T3: Forecast API endpoints**

**IMMEDIATE TASK:**
```bash
cd emerald-hills-weather-backend
python3 pm.py start E2-T3 backend
```

**DELIVERABLES:**
1. **Create `src/api/forecast.js`**: Personalized prediction endpoints
2. **Build correlation engine**: Use E1-T1 station data for Emerald Hills predictions
3. **Apply elevation adjustments**: 440ft lapse rate calculations
4. **API endpoints to create**:
   - `GET /api/forecast/emerald-hills` - Personalized current conditions
   - `GET /api/forecast/comparison` - Your forecast vs standard forecast
   - `GET /api/forecast/correlation` - Which stations are used for prediction
   - `GET /api/forecast/confidence` - Prediction confidence levels

**SUCCESS CRITERIA:**
- APIs return different predictions than standard SF forecasts
- Correlation analysis shows which Peninsula stations influence prediction
- Elevation adjustment applied (expect ~1.5°F warmer than sea level)
- Error handling for missing station data

**COORDINATION:**
- Update `docs/features.md` with "@frontend - APIs ready for integration"
- Share API documentation in `docs/data-schema.md`
- Test endpoints return realistic data before marking complete

---

## 🎨 FRONTEND AGENT - CURRENT ASSIGNMENT

### Your Directory: `emerald-hills-weather-frontend`  
### Your Ticket: **E2-T2: Current conditions display**

**IMMEDIATE TASK:**
```bash
cd emerald-hills-weather-frontend
python3 pm.py start E2-T2 frontend
```

**DELIVERABLES:**
1. **Create React components**:
   - `src/components/WeatherCard.jsx` - Main weather display
   - `src/components/TemperatureComparison.jsx` - Your temp vs standard forecast
   - `src/components/StationCorrelation.jsx` - Which stations influence prediction
   - `src/components/ConfidenceIndicator.jsx` - Prediction confidence

2. **Mobile-first responsive design**:
   - Works on phone (primary use case)
   - Clean, fast-loading interface
   - Clear "Your Weather: 78°F vs Forecast: 65°F" comparison

3. **Backend integration**:
   - Connect to E2-T3 APIs when ready
   - Handle loading states and errors
   - Show real data vs placeholder

**SUCCESS CRITERIA:**
- Dashboard loads in under 3 seconds
- Clear visual difference between Emerald Hills and standard forecast
- Mobile-responsive and touch-friendly
- Shows why prediction differs (station correlation)

**COORDINATION:**
- Watch `docs/features.md` for "@frontend" updates from backend
- Update with "@backend - need X endpoint" when blocked
- Share UI components with "@qa - ready for testing"

---

## 🧪 QA AGENT - CURRENT ASSIGNMENT

### Your Directory: `emerald-hills-weather-qa`
### Your Ticket: **E2-T5: Basic dashboard testing** 

**IMMEDIATE TASK:**
```bash
cd emerald-hills-weather-qa  
python3 pm.py start E2-T5 qa
```

**DELIVERABLES:**
1. **API testing**: Test backend endpoints (E2-T3) for accuracy and edge cases
2. **Frontend testing**: Validate UI components (E2-T2) work correctly
3. **Integration testing**: End-to-end workflow testing
4. **Mobile testing**: Verify responsive design on different devices
5. **Accuracy validation**: Confirm predictions make sense vs actual conditions

**TEST SCENARIOS:**
- Happy path: Dashboard loads and shows different forecast
- Error handling: What happens when APIs fail
- Mobile experience: Touch interactions, readability
- Data accuracy: Do temperature predictions seem reasonable?
- Performance: Load times under 3 seconds

**SUCCESS CRITERIA:**
- All API endpoints return valid data
- Frontend handles loading and error states
- Mobile interface is usable
- Predictions differ meaningfully from standard forecasts

**COORDINATION:**
- Monitor `docs/features.md` for completed tickets to test
- Report bugs with "@backend" or "@frontend" mentions
- Approve tickets only when quality standards met

---

## 🎨 DESIGN AGENT - CURRENT ASSIGNMENT

### Your Directory: `emerald-hills-weather-design`
### Your Ticket: **E2-T1: Dashboard UI design**

**IMMEDIATE TASK:**
```bash
cd emerald-hills-weather-design
python3 pm.py start E2-T1 design
```

**DELIVERABLES:**
1. **UI mockups**: Clean weather dashboard design
2. **Mobile-first approach**: Phone is primary use case
3. **Comparison focus**: Clear "Your Weather vs Standard" display
4. **Visual hierarchy**: Most important info (temperature) prominent
5. **Design system**: Consistent colors, typography, spacing

**DESIGN REQUIREMENTS:**
- Quick weather check (under 10 seconds)
- Clear temperature difference visualization
- Confidence indicator for predictions
- Station correlation explanation
- Professional but approachable aesthetic

**SUCCESS CRITERIA:**
- Mockups show clear information hierarchy
- Mobile design fits in thumb-reach zones
- Visual comparison between forecasts is obvious
- Design feels trustworthy and accurate

**COORDINATION:**
- Share designs with "@frontend - mockups ready for implementation"
- Provide specific guidance: colors, spacing, typography
- Review frontend implementation for design compliance

---

## 🔄 COORDINATION PROTOCOL

### File Synchronization
```bash
# Run from parent directory to sync shared files
./sync_agents.sh
```

### Communication Via features.md
- Update `docs/features.md` after completing work
- Use @mentions to communicate with other agents
- Report blockers and dependencies clearly
- Share progress and next steps

### PM Status Monitoring
```bash
# Check overall project status
python3 pm.py status

# View recent updates
tail docs/features.md
```

### Ticket Completion
```bash
# When your work is done:
python3 pm.py complete E2-TX agentname file1.js file2.jsx
```

### Dependencies & Handoffs
- **Backend → Frontend**: APIs must be ready before UI integration
- **Design → Frontend**: Mockups guide implementation
- **Frontend/Backend → QA**: Testing begins when components complete
- **All → PM**: Regular updates via features.md

---

## 🚀 SUCCESS METRICS

### Epic 2 Complete When:
- ✅ Working dashboard showing Emerald Hills personalized weather
- ✅ Clear temperature difference from standard SF forecasts  
- ✅ Mobile-responsive interface loads under 3 seconds
- ✅ User understands why prediction differs (station correlation)
- ✅ All QA testing passes
- ✅ PM approves final deliverable

### Coordination Success:
- No agent blocked for more than 30 minutes
- Clear communication via features.md
- Realistic handoffs between agents
- Quality maintained throughout parallel development

**Each agent should read this file, find their section, and begin work immediately. Update progress regularly and coordinate via docs/features.md.**