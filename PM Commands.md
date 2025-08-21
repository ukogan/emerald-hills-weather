PM Commands

python3 pm.py status - Project overview
python3 pm.py risks - Risk assessment status
python3 pm.py epic <id> <n> <description> - Create epic
python3 pm.py ticket <id> <epic> <title> <agent> - Create ticket

Agent Workflow

Check assignment: python3 pm.py status
Start work: python3 pm.py start <ticket-id> <agent-name>
Update docs/features.md with progress
Complete: python3 pm.py complete <ticket-id> <agent-name> [files]

Architecture

Frontend: React + Tailwind CSS
Backend: Node.js + Express
Database: SQLite for correlation data
APIs: OpenWeatherMap + National Weather Service
Target: 363 Lakeview Way, Emerald Hills (440 ft elevation)

Current Epic: Data Foundation
E1-T1: Weather API Integration 🔄
Agent: Backend
Goal: Connect to OpenWeather and NWS APIs
Files: src/api/weather.js, src/services/weatherAPI.js
E1-T2: Data Collection System ⏳
Agent: Backend
Goal: Collect hourly data from 5-6 stations
Dependencies: E1-T1
See docs/features.md for detailed progress tracking.
Getting OpenWeather API Key

Go to https://openweathermap.org/api
Sign up for free account
Get API key from dashboard
Add to .env file: OPENWEATHER_API_KEY=your_key_here

