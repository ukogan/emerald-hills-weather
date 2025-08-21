# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personalized weather dashboard for 363 Lakeview Way, Emerald Hills, CA (440 ft elevation). The project addresses the problem that standard SF Peninsula weather forecasts under-predict temperatures at elevated locations due to marine layer effects. The goal is to build correlation models using nearby weather stations to provide accurate local temperature predictions.

## Development Commands

**Project Management (Required):**
```bash
python3 pm.py status                    # Check project status and current assignments
python3 pm.py start <ticket-id> <agent> # Start work on a ticket
python3 pm.py complete <ticket-id> <agent> [files] # Complete work on a ticket
```

**Development:**
```bash
npm install                             # Install dependencies
npm run dev                            # Start development server with nodemon
npm start                              # Start production server
npm test                               # Run Jest tests
```

**Environment Setup:**
```bash
cp .env.example .env                   # Copy environment template
# Add OpenWeather API key to .env: OPENWEATHER_API_KEY=your_key_here
```

## Architecture

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite for correlation data storage
- APIs: OpenWeatherMap + National Weather Service

**Project Management System:**
This project uses a Python-based PM system (`pm.py`) that manages agent assignments, ticket tracking, and inter-agent communication. Always check your current assignment with `python3 pm.py status` before starting work.

**Agent-Based Development:**
- `backend` agent: APIs, databases, server logic, correlation analysis
- `frontend` agent: React components, user interface, data visualization  
- `qa` agent: Testing, validation, quality assurance

## Key Project Files

**Configuration:**
- `agent_status.json` - Current project state, ticket assignments, agent status
- `PM Commands.md` - Quick reference for project management commands
- `agent_instructions/backend_agent.md` - Detailed backend agent instructions

**Documentation (Always Keep Updated):**
- `docs/features.md` - Feature implementation tracking with file references
- `docs/data-schema.md` - Database schema and API specifications
- `docs/prd.md` - Product requirements and user stories
- `docs/risks.md` - Project risks and mitigation strategies

## Weather Station Configuration

**Target Location:** 363 Lakeview Way, Emerald Hills (37.4419°N, 122.2708°W, 440 ft)

**Key Stations for Correlation Analysis:**
- San Jose (KSJC) - Expected best correlation for hot days
- Redwood City - Closest but marine layer influenced  
- Palo Alto (KPAO) - Inland with similar elevation patterns
- San Mateo - Coastal reference point
- Half Moon Bay - Marine layer reference point

## Development Workflow

**Before Starting Any Work:**
1. Check assignment: `python3 pm.py status`
2. Read current ticket details in `agent_status.json`
3. Review `docs/features.md` for context
4. Start ticket: `python3 pm.py start <ticket-id> <agent-name>`

**During Development:**
- Update `docs/features.md` immediately when implementing features
- Include file paths and line numbers for cross-referencing
- Document API test results, rate limits, and data quality findings
- Use @pm, @frontend, @backend mentions in docs for inter-agent communication

**Completing Work:**
- Test all implementations thoroughly
- Update documentation with detailed findings
- Complete ticket: `python3 pm.py complete <ticket-id> <agent-name> [modified-files]`

## Critical Success Metrics

**Primary Goal:** Temperature predictions within 3°F of actual conditions 80% of the time (vs ~60% for standard forecasts)

**Technical Requirements:**
- Dashboard loads in under 3 seconds
- API calls stay within free tier rate limits (OpenWeather: 1000/day, 60/minute)
- Real-time data updates every 30 minutes
- Correlation analysis uses 5-6 weather stations

## Current Project Status

**Phase:** Risk Validation (Week 1)
**Current Epic:** E1 - Data Foundation & Validation
**Risk Status:** 🔴 Red (APIs unvalidated)

The project is in early validation phase focusing on confirming that sufficient weather data exists for building meaningful correlation models. Backend agent currently owns critical API integration work.

## Environment Variables

Required in `.env`:
```
OPENWEATHER_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

## File Structure Ownership

**Backend Agent:**
- `src/api/` - Express API endpoints
- `src/services/` - External API integrations 
- `src/models/` - Database models and correlation logic
- `src/utils/` - Server-side utilities

**Frontend Agent:**
- `src/components/` - React components
- `src/pages/` - Page-level components
- `src/utils/` - Client-side utilities

**Shared:**
- `docs/` - All agents must keep documentation current
- `tests/` - Test files organized by component ownership