# Agent Coordination Guide
## Emerald Hills Weather Dashboard - Parallel Development

**PROJECT STATUS**: Ready for parallel development across 4 agent types  
**CURRENT PHASE**: Epic 1 (Risk Validation) + Epic 2 (Core Dashboard) parallel execution

---

## 🎯 COORDINATION OVERVIEW

This project uses **parallel agent development** with shared state management. All agents work on the same codebase but have specialized roles and assigned tickets.

### 📊 Shared State Files (ALWAYS SYNC BEFORE STARTING):
- `agent_status.json` - Project state, ticket assignments, inter-agent communication
- `docs/features.md` - Implementation tracking with file references  
- `src/` - Shared codebase (all agents contribute)

### 🔄 Before Each Session:
1. **SYNC FIRST**: Run `./sync_agents.sh` to get latest project state
2. **CHECK STATUS**: `python3 pm.py status` to see current assignments
3. **START TICKET**: `python3 pm.py start <ticket-id> <your-agent-name>`
4. **UPDATE DOCS**: Always update `docs/features.md` with progress

### 📋 After Completing Documentation Changes:
If you've updated any documentation files in your agent directory, **sync changes back to main**:

**Critical Documentation Files to Sync Back**:
- `docs/architecture.md` - Architecture decisions and changes
- `docs/data-schema.md` - Database and API schema updates  
- `docs/features.md` - Feature implementation tracking
- `docs/implementation_plan.md` - Development plans and roadmaps
- `docs/prd.md` - Product requirements and user story updates
- `docs/risks.md` - Risk assessments and mitigation updates

**Reverse Sync Process**:
```bash
# From your agent directory, copy docs back to main
cp docs/architecture.md ../emerald-hills-weather/docs/
cp docs/data-schema.md ../emerald-hills-weather/docs/
cp docs/features.md ../emerald-hills-weather/docs/
cp docs/implementation_plan.md ../emerald-hills-weather/docs/
cp docs/prd.md ../emerald-hills-weather/docs/
cp docs/risks.md ../emerald-hills-weather/docs/

# Then run sync to distribute to other agents
cd ../
./sync_agents.sh
```

**⚠️ Important**: Always run the full sync after updating documentation to ensure all agents have the latest coordination information.

---

## 👥 AGENT ROLES & CURRENT ASSIGNMENTS

### 🎨 DESIGN AGENT
**Role**: UI/UX design, wireframes, user experience
**Directory**: `emerald-hills-weather-design/`
**Current Tickets**:
- **E2-T1**: Dashboard UI design (in progress)

**Responsibilities**:
- Create UI mockups and wireframes for weather dashboard
- Design responsive layouts for mobile/desktop
- Define user interaction patterns for weather data display
- Create design system/component specifications

**Key Files**:
- `docs/design/` - Design specifications and mockups
- `docs/features.md` - Update with design decisions and rationale

---

### 💻 FRONTEND AGENT  
**Role**: React components, client-side logic, UI implementation
**Directory**: `emerald-hills-weather-frontend/`
**Current Tickets**:
- **E2-T2**: Current conditions display (in progress)
- **E2-T4**: Frontend-backend integration (depends on E2-T3)

**Responsibilities**:
- Implement React components based on design specifications
- Create responsive weather data visualizations
- Handle API integration and data fetching
- Implement user interactions and state management

**Key Files**:
- `src/components/` - React components
- `src/pages/` - Page-level components  
- `src/utils/` - Client-side utilities

---

### ⚙️ BACKEND AGENT
**Role**: APIs, data processing, server logic, correlation analysis  
**Directory**: `emerald-hills-weather-backend/`
**Current Tickets**:
- **E1-T2**: Data collection system (completed, integrated)
- **E1-T3**: Basic correlation analysis (completed, integrated)
- **E1-T4**: Elevation adjustment calculation (in progress)
- **E2-T3**: Forecast API endpoints (ready to start)

**Responsibilities**:
- Build automated weather data collection system
- Implement correlation analysis for station comparison
- Create personalized forecast algorithms with elevation adjustments
- Maintain database schema and API endpoints

**Key Files**:
- `src/api/` - Express API endpoints
- `src/services/` - External API integrations
- `src/models/` - Database models and correlation logic

---

### 🧪 QA AGENT
**Role**: Testing, validation, quality assurance
**Directory**: `emerald-hills-weather-qa/`  
**Current Tickets**:
- **E1-T5**: API validation testing (in progress)
- **E2-T5**: Basic dashboard testing (depends on E2-T2, E2-T3)

**Responsibilities**:
- Validate API reliability and data quality
- Test frontend components and user workflows
- Performance testing and optimization
- Integration testing across components

**Key Files**:
- `tests/` - Test suites organized by component
- `docs/testing/` - Test plans and results

---

### 🏗️ ARCHITECT AGENT
**Role**: Architectural oversight, design consistency, integration problem solving
**Directory**: `emerald-hills-weather-architect/`
**Current Tickets**:
- **ARC-T1**: Architecture compliance review (ready to start)
- **ARC-T2**: Frontend-backend integration architecture (depends on E2-T1)

**Responsibilities**:
- Monitor code integration for architectural compliance
- Solve architectural problems that block other agents
- Maintain design consistency across parallel development
- Review staging integrations for architectural integrity
- Update architecture documentation as system evolves

**Key Files**:
- `docs/architecture.md` - Core architectural documentation
- `src/` - Review all code for architectural compliance
- Integration patterns and standards

---

### 🚀 DEPLOYMENT ENGINEER AGENT
**Role**: Integration orchestration, deployment pipeline, delivery management
**Directory**: `emerald-hills-weather-deployment/`
**Current Tickets**:
- **DEP-T1**: Staging integration and deployment pipeline (ready to start)
- **DEP-T2**: GitHub repository setup and CI/CD (priority)

**Responsibilities**:
- Monitor project progress and coordinate agent work completion
- Orchestrate integration from agent directories to staging environment
- Manage deployment pipeline from staging to production
- Ensure commits and deployments happen at proper milestones
- Implement CI/CD automation and quality gates

**Key Files**:
- `scripts/` - Integration and deployment automation
- `.github/workflows/` - CI/CD pipeline configuration
- `deployment/` - Environment configurations
- Release management and coordination

---

## 🔄 INTER-AGENT COMMUNICATION

### Status Updates in `docs/features.md`:
```markdown
**Status Update**: @design - UI mockups complete, ready for frontend implementation
**Blocker**: @backend - Need E2-T3 API endpoints before starting E2-T4 integration
**Risk**: @qa - API rate limits higher than expected, may need optimization
```

### PM System Commands:
```bash
# Check what's assigned to you
python3 pm.py status

# Start working on a ticket  
python3 pm.py start E2-T1 design

# Complete your work
python3 pm.py complete E2-T1 design docs/design/dashboard-mockup.md

# Check other agents' progress
python3 pm.py status
```

---

## 🎯 CURRENT PRIORITIES

### 🚨 HIGH PRIORITY (Week 1 - Risk Validation)
1. **E1-T2** (Backend): Data collection system - Critical for correlation analysis
2. **E1-T5** (QA): API validation testing - Confirm E1-T1 success holds under load
3. **E2-T1** (Design): Dashboard UI design - Unblocks frontend development

### 🔄 PARALLEL DEVELOPMENT (Week 1-2)
1. **E2-T2** (Frontend): Current conditions display - Can start with design mockups
2. **E2-T3** (Backend): Forecast API endpoints - Parallel to data collection work

### ⏳ DEPENDS ON COMPLETION
1. **E1-T3** (Backend): Correlation analysis - Needs E1-T2 data collection
2. **E2-T4** (Frontend): Integration - Needs E2-T3 API endpoints
3. **E2-T5** (QA): Dashboard testing - Needs E2-T2 + E2-T3 complete

---

## 🔧 TECHNICAL COORDINATION

### API Endpoints (Backend → Frontend):
- `GET /api/weather/current` - Current conditions for Emerald Hills
- `GET /api/weather/stations` - All correlation stations data  
- `GET /api/weather/forecast` - Personalized forecast (E2-T3)
- `GET /api/weather/correlation` - Station correlation analysis (E1-T3)

### Component Architecture (Design → Frontend):
- `CurrentConditions` - Main weather display component
- `StationComparison` - Correlation visualization
- `ForecastDisplay` - Personalized forecast component
- `Dashboard` - Main page layout

### Data Flow:
```
External APIs → Backend Services → Database → API Endpoints → Frontend Components → User Interface
```

---

## 🚨 CRITICAL SUCCESS METRICS

### Epic 1 Validation Criteria:
- [ ] Data collection system reliably gathers data from 5+ stations
- [ ] Correlation analysis shows meaningful patterns (San Jose > coastal for hot days)
- [ ] API rate limits confirmed sustainable for 30-minute updates

### Epic 2 Dashboard Criteria:  
- [ ] Dashboard loads current conditions in under 3 seconds
- [ ] Shows meaningful temperature differences vs generic forecasts
- [ ] Mobile-responsive design for on-the-go checking

---

## 🔄 INTEGRATION & DEPLOYMENT WORKFLOW

### Environment Strategy:
- **Development**: Agent directories (`emerald-hills-weather-{agent}/`)
- **Staging**: `emerald-hills-weather/` (integration testing)
- **Production**: GitHub repository deployment

### Ticket-Level Integration Process:

#### 1. Complete Ticket in Agent Directory:
```bash
# Agent completes work in their directory
python3 pm.py complete E1-T2 backend src/services/dataCollection.js

# Update documentation
# Edit docs/features.md with completion details
```

#### 2. Integrate to Staging:
```bash
# Integrate completed changes to staging environment
cp -r emerald-hills-weather-backend/src/* emerald-hills-weather/src/
cd emerald-hills-weather

# Test integration
npm test
npm run dev  # Verify staging works

# Commit to staging
git add .
git commit -m "integrate: E1-T2 data collection system"
```

#### 3. Integration Testing:
```bash
# QA agent validates staging environment
cd emerald-hills-weather
npm run dev  # Test integrated system
curl http://localhost:3001/api/weather/test  # Validate APIs
```

#### 4. Deploy to Production:
```bash
# After QA approval, push to main branch
git push origin main
# Automated deployment to production environment
```

### During Development:
- **Work in agent directories**: Parallel development continues
- **Sync regularly**: `./sync_agents.sh` for coordination
- **Update docs**: `docs/features.md` with progress and file references
- **Use @mentions**: For inter-agent communication

### Integration Gates:
- ✅ **Ticket complete**: All acceptance criteria met
- ✅ **Tests pass**: No regressions in staging
- ✅ **QA approval**: Integration testing successful
- ✅ **Documentation updated**: Features.md reflects changes

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Environment Tiers:
1. **Development**: Agent directories (localhost:various)
2. **Staging**: `emerald-hills-weather/` (localhost:3001)
3. **Production**: Live deployment

### GitHub Repository Structure:
```
emerald-hills-weather/
├── src/                    # Integrated source code
├── docs/                   # Project documentation  
├── tests/                  # Integration tests
├── .github/workflows/      # CI/CD automation
├── vercel.json            # Deployment configuration
└── README.md              # Public project documentation
```

### Deployment Options:

#### Option 1: Vercel (Recommended)
- **Frontend**: React app with static generation
- **Backend**: Vercel Functions (serverless)
- **Database**: Vercel KV or external service
- **Advantages**: Free tier, automatic deployments, great performance

#### Option 2: Railway/Heroku
- **Full-stack**: Node.js + React
- **Database**: PostgreSQL/SQLite
- **Advantages**: Traditional server architecture, persistent storage

#### Option 3: Split Architecture
- **Frontend**: GitHub Pages (static React build)
- **Backend**: Separate API deployment (Railway, etc.)
- **Database**: External service

### GitHub Pages Limitation:
❌ **Cannot host full project** due to:
- Backend APIs required (Express.js)
- Server-side weather data processing
- Database operations for correlation analysis
- External API integrations requiring server-side calls

### Recommended: Vercel Deployment
```bash
# Setup for Vercel
npm install -g vercel
vercel init
vercel --prod
```

---

## 🎯 SUCCESS INDICATORS

**Green Light Indicators**:
- All APIs working consistently across test cycles
- Temperature correlation patterns clearly visible in data
- Frontend components rendering weather data correctly
- Dashboard responds quickly and shows local prediction accuracy

**Red Flag Triggers**:
- API rate limits preventing real-time updates
- No meaningful correlation patterns in station data  
- Dashboard performance below 3-second load target
- Inaccurate local predictions compared to actual conditions

**Weekly Checkpoints**:
- Monday: Sprint planning and ticket assignment review
- Wednesday: Progress sync and blocker resolution
- Friday: Demo preparation and risk assessment

---

**Remember**: This is **parallel development** - multiple agents working simultaneously. Communication through `docs/features.md` and the PM system is critical for coordination!